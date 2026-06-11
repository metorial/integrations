import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { pathExists, type WorkspaceIntegrationSummary } from '../lib/integration';

export type Severity = 'error' | 'warn' | 'info';

export interface CheckContext {
  integration: WorkspaceIntegrationSummary;
  srcFiles: string[];
  hasFile: (relative: string) => Promise<boolean>;
  read: (relative: string) => Promise<string>;
  readJson: <T = Record<string, unknown>>(relative: string) => Promise<T>;
}

export interface CheckResult {
  failed: boolean;
  detail: string;
}

export interface CheckSpec {
  name: string;
  severity: Severity;
  description: string;
  run: (ctx: CheckContext) => Promise<CheckResult | null>;
}

export let SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warn: 1,
  info: 2
};

let SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo']);
let ZOD_FIELD_REGEX = /^\s+\w+:\s*z\.\w+\(/;
let RAW_THROW_REGEX = /throw new Error\(/g;
let OAUTH_PROBE_REGEX = /oauth/i;

let walkTsFiles = async (dir: string): Promise<string[]> => {
  if (!(await pathExists(dir))) return [];
  let collected: string[] = [];
  let stack = [dir];
  while (stack.length > 0) {
    let current = stack.pop()!;
    let entries = await readdir(current, { withFileTypes: true });
    for (let entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        stack.push(path.join(current, entry.name));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
      ) {
        collected.push(path.join(current, entry.name));
      }
    }
  }
  return collected;
};

let collapseChains = (source: string) => source.replace(/\n\s*\./g, '.');

let countRawThrows = async (srcFiles: string[], read: (file: string) => Promise<string>) => {
  let count = 0;
  await Promise.all(
    srcFiles.map(async file => {
      if (file.endsWith('.test.ts')) return;
      let content = await read(file);
      let matches = content.match(RAW_THROW_REGEX);
      if (matches) count += matches.length;
    })
  );
  return count;
};

let countMissingZodDescribes = async (
  srcFiles: string[],
  read: (file: string) => Promise<string>
) => {
  let missing = 0;
  let scanned = 0;
  await Promise.all(
    srcFiles.map(async file => {
      if (file.endsWith('.test.ts')) return;
      let content = await read(file);
      let collapsed = collapseChains(content);
      for (let line of collapsed.split('\n')) {
        if (!ZOD_FIELD_REGEX.test(line)) continue;
        scanned++;
        if (!line.includes('.describe(')) missing++;
      }
    })
  );
  return { missing, scanned };
};

export let CHECKS: CheckSpec[] = [
  {
    name: 'raw-throws',
    severity: 'error',
    description: 'src/ has raw `throw new Error(...)` - use lib/errors.ts helpers',
    run: async ({ srcFiles, hasFile, read }) => {
      let throwCount = await countRawThrows(srcFiles, read);
      if (throwCount === 0) return { failed: false, detail: '' };
      let hasErrorsHelper = await hasFile('src/lib/errors.ts');
      let suffix = hasErrorsHelper
        ? ' (partial: lib/errors.ts exists)'
        : ' (no lib/errors.ts)';
      return {
        failed: true,
        detail: `${throwCount} raw throw${throwCount === 1 ? '' : 's'}${suffix}`
      };
    }
  },
  {
    name: 'scope-file',
    severity: 'error',
    description: 'OAuth integration without src/scopes.ts',
    run: async ({ hasFile, read }) => {
      if (!(await hasFile('src/auth.ts'))) return null;
      let authContent = await read('src/auth.ts');
      if (!OAUTH_PROBE_REGEX.test(authContent)) return null;
      if (await hasFile('src/scopes.ts')) return { failed: false, detail: '' };
      return { failed: true, detail: 'OAuth detected in auth.ts but no scopes.ts' };
    }
  },
  {
    name: 'vitest-config',
    severity: 'error',
    description: 'test files present but no vitest.config.ts',
    run: async ({ srcFiles, hasFile }) => {
      let hasTests = srcFiles.some(file => file.endsWith('.test.ts'));
      if (!hasTests) return null;
      if (await hasFile('vitest.config.ts')) return { failed: false, detail: '' };
      return { failed: true, detail: 'tests present, no vitest.config.ts' };
    }
  },
  {
    name: 'contract-tests',
    severity: 'warn',
    description: 'src/auth.ts present but no *.contract.test.ts',
    run: async ({ srcFiles, hasFile }) => {
      if (!(await hasFile('src/auth.ts'))) return null;
      let hasContractTest = srcFiles.some(file => file.endsWith('.contract.test.ts'));
      if (hasContractTest) return { failed: false, detail: '' };
      return { failed: true, detail: 'auth.ts present, no contract tests' };
    }
  },
  {
    name: 'zod-describe',
    severity: 'warn',
    description: 'Zod field declarations without .describe()',
    run: async ({ srcFiles, read }) => {
      let { missing, scanned } = await countMissingZodDescribes(srcFiles, read);
      if (missing === 0) return { failed: false, detail: '' };
      let pct = scanned > 0 ? Math.round((missing / scanned) * 100) : 0;
      return {
        failed: true,
        detail: `${missing}/${scanned} field${scanned === 1 ? '' : 's'} (${pct}%) missing .describe()`
      };
    }
  },
  {
    name: 'readme',
    severity: 'info',
    description: 'integration is missing a README.md',
    run: async ({ hasFile }) => {
      if (await hasFile('README.md')) return { failed: false, detail: '' };
      return { failed: true, detail: 'no README.md' };
    }
  }
];

export let buildCheckContext = async (
  integration: WorkspaceIntegrationSummary
): Promise<CheckContext> => {
  let srcDir = path.join(integration.dirPath, 'src');
  let srcFiles = await walkTsFiles(srcDir);
  let resolve = (relative: string) =>
    path.isAbsolute(relative) ? relative : path.join(integration.dirPath, relative);
  return {
    integration,
    srcFiles,
    hasFile: relative => pathExists(resolve(relative)),
    read: relative => readFile(resolve(relative), 'utf-8'),
    readJson: async relative => JSON.parse(await readFile(resolve(relative), 'utf-8'))
  };
};
