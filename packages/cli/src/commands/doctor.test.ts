import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { runDoctor } from './doctor';

let tempDirs: string[] = [];

let createTempDir = async () => {
  let dir = await mkdtemp(path.join(tmpdir(), 'slates-cli-doctor-'));
  tempDirs.push(dir);
  return dir;
};

let writeIntegration = async (
  cwd: string,
  name: string,
  files: Record<string, string>,
  opts: { root?: string; packageJson?: Record<string, unknown> } = {}
) => {
  let root = opts.root ?? 'integrations';
  let dir = path.join(cwd, root, name);
  await mkdir(path.join(dir, 'src'), { recursive: true });
  let manifest = {
    name: `@slates/${name}`,
    description: `${name} integration`,
    author: 'Test Author',
    license: 'FSL 1.1',
    source: 'src/index.ts',
    main: 'src/index.ts',
    ...(opts.packageJson ?? {})
  };
  await writeFile(
    path.join(dir, 'package.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf-8'
  );
  for (let [relative, content] of Object.entries(files)) {
    let target = path.join(dir, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf-8');
  }
};

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});

let getCheck = (report: NonNullable<Awaited<ReturnType<typeof runDoctor>>>, name: string) => {
  let match = report.checks.find(check => check.name === name);
  if (!match) throw new Error(`Check ${name} missing from report`);
  return match;
};

describe('runDoctor - raw-throws', () => {
  it('flags integrations with raw throws and no lib/errors.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'demo', {
      'src/index.ts': 'export let provider = {};\n',
      'src/tools.ts': "throw new Error('oops');\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'raw-throws').failures).toEqual([
      { integration: 'demo', detail: '1 raw throw (no lib/errors.ts)' }
    ]);
  });

  it('does not flag integrations using lib/errors.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'clean', {
      'src/index.ts': 'export let provider = {};\n',
      'src/lib/errors.ts': 'export let cleanError = (msg: string) => msg;\n',
      'src/tools.ts': "import { cleanError } from './lib/errors';\nlet x = cleanError('hi');\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'raw-throws').failures).toEqual([]);
  });

  it('flags partial migrations when raw throws remain alongside lib/errors.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'partial', {
      'src/index.ts': 'export let provider = {};\n',
      'src/lib/errors.ts': 'export let partialError = (msg: string) => msg;\n',
      'src/tools.ts': "throw new Error('still raw');\nthrow new Error('twice');\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'raw-throws').failures).toEqual([
      { integration: 'partial', detail: '2 raw throws (partial: lib/errors.ts exists)' }
    ]);
  });

  it('ignores raw throws inside *.test.ts files', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'testy', {
      'src/index.ts': 'export let provider = {};\n',
      'src/index.test.ts': "throw new Error('test scaffold throw');\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'raw-throws').failures).toEqual([]);
  });
});

describe('runDoctor - scope-file', () => {
  it('flags OAuth integrations missing src/scopes.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'oauth-only', {
      'src/index.ts': 'export let provider = {};\n',
      'src/auth.ts': "// Google OAuth flow\nexport let auth = { method: 'oauth' };\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'scope-file').failures).toEqual([
      { integration: 'oauth-only', detail: 'OAuth detected in auth.ts but no scopes.ts' }
    ]);
  });

  it('does not flag non-OAuth integrations even without scopes.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'api-key', {
      'src/index.ts': 'export let provider = {};\n',
      'src/auth.ts': 'export let auth = { method: "api_key" };\n'
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'scope-file').failures).toEqual([]);
  });

  it('does not flag OAuth integrations that have scopes.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'good-oauth', {
      'src/index.ts': 'export let provider = {};\n',
      'src/auth.ts': '// OAuth-based\nexport let auth = {};\n',
      'src/scopes.ts': 'export let scopes = {};\n'
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'scope-file').failures).toEqual([]);
  });
});

describe('runDoctor - contract-tests', () => {
  it('flags integrations with auth.ts but no contract test', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'untested', {
      'src/index.ts': 'export let provider = {};\n',
      'src/auth.ts': 'export let auth = {};\n'
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'contract-tests').failures).toEqual([
      { integration: 'untested', detail: 'auth.ts present, no contract tests' }
    ]);
  });

  it('does not flag integrations with contract tests', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'tested', {
      'src/index.ts': 'export let provider = {};\n',
      'src/auth.ts': 'export let auth = {};\n',
      'src/auth.contract.test.ts': "import { it } from 'vitest';\nit('passes', () => {});\n",
      'vitest.config.ts': 'export default { test: {} };\n'
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'contract-tests').failures).toEqual([]);
  });
});

describe('runDoctor - vitest-config', () => {
  it('flags test files without a vitest.config.ts', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'no-config', {
      'src/index.ts': 'export let provider = {};\n',
      'src/index.test.ts': "import { it } from 'vitest';\nit('runs', () => {});\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'vitest-config').failures).toEqual([
      { integration: 'no-config', detail: 'tests present, no vitest.config.ts' }
    ]);
  });
});

describe('runDoctor - zod-describe', () => {
  it('flags Zod field declarations missing .describe()', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'undescribed', {
      'src/index.ts':
        "import { z } from 'zod';\nexport let schema = z.object({\n  one: z.string(),\n  two: z.number()\n});\n"
    });

    let report = await runDoctor({ cwd, json: true });
    let zod = getCheck(report!, 'zod-describe').failures;
    expect(zod).toHaveLength(1);
    expect(zod[0]!.integration).toBe('undescribed');
    expect(zod[0]!.detail).toMatch(/2\/2 fields \(100%\) missing \.describe\(\)/);
  });

  it('does not flag schemas where every field has .describe()', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'described', {
      'src/index.ts':
        "import { z } from 'zod';\nexport let schema = z.object({\n  one: z.string().describe('first'),\n  two: z.number().optional().describe('second')\n});\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'zod-describe').failures).toEqual([]);
  });

  it('handles multi-line chained schemas via line collapse', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'chained', {
      'src/index.ts':
        "import { z } from 'zod';\nexport let schema = z.object({\n  one: z\n    .string()\n    .optional()\n    .describe('first')\n});\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'zod-describe').failures).toEqual([]);
  });
});

describe('runDoctor - readme', () => {
  it('flags integrations without a README.md', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'no-readme', {
      'src/index.ts': 'export let provider = {};\n'
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'readme').failures).toEqual([
      { integration: 'no-readme', detail: 'no README.md' }
    ]);
  });

  it('does not flag integrations that have a README.md', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'documented', {
      'src/index.ts': 'export let provider = {};\n',
      'README.md': '# documented\n'
    });

    let report = await runDoctor({ cwd, json: true });
    expect(getCheck(report!, 'readme').failures).toEqual([]);
  });
});

describe('runDoctor - workspace selection', () => {
  it('skips test-integrations by default', async () => {
    let cwd = await createTempDir();
    await writeIntegration(
      cwd,
      'fixture',
      { 'src/tools.ts': "throw new Error('oops');\n" },
      { root: 'test-integrations' }
    );

    let report = await runDoctor({ cwd, json: true });
    expect(report!.auditedIntegrations).toBe(0);
  });

  it('includes test-integrations when includeTestIntegrations is true', async () => {
    let cwd = await createTempDir();
    await writeIntegration(
      cwd,
      'fixture',
      { 'src/tools.ts': "throw new Error('oops');\n" },
      { root: 'test-integrations' }
    );

    let report = await runDoctor({ cwd, json: true, includeTestIntegrations: true });
    expect(report!.auditedIntegrations).toBe(1);
  });

  it('throws on unknown --check name', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'demo', { 'src/index.ts': 'export let provider = {};\n' });

    await expect(runDoctor({ cwd, json: true, check: 'fake-check' })).rejects.toThrow(
      /Unknown check/
    );
  });

  it('throws when --integration matches no workspace integration', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'demo', { 'src/index.ts': 'export let provider = {};\n' });

    await expect(runDoctor({ cwd, json: true, integration: 'missing' })).rejects.toThrow(
      /No integration named "missing"/
    );
  });

  it('filters by --integration name', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'one', { 'src/tools.ts': "throw new Error('a');\n" });
    await writeIntegration(cwd, 'two', { 'src/tools.ts': "throw new Error('b');\n" });

    let report = await runDoctor({ cwd, json: true, integration: 'one' });
    expect(report!.auditedIntegrations).toBe(1);
    expect(getCheck(report!, 'raw-throws').failures.map(f => f.integration)).toEqual(['one']);
  });

  it('returns only the requested check when --check is set', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'demo', {
      'src/auth.ts': 'export let auth = {};\n',
      'src/tools.ts': "throw new Error('oops');\n"
    });

    let report = await runDoctor({ cwd, json: true, check: 'contract-tests' });
    expect(report!.checks).toHaveLength(1);
    expect(report!.checks[0]!.name).toBe('contract-tests');
  });
});

describe('runDoctor - severity', () => {
  it('attaches severity to every check in the JSON report', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'demo', { 'src/index.ts': 'export let provider = {};\n' });

    let report = await runDoctor({ cwd, json: true });
    let severities = new Set(report!.checks.map(check => check.severity));
    expect(severities).toEqual(new Set(['error', 'warn', 'info']));
  });

  it('tallies totals by severity in the JSON report', async () => {
    let cwd = await createTempDir();
    await writeIntegration(cwd, 'demo', {
      'src/index.ts': 'export let provider = {};\n',
      'src/tools.ts': "throw new Error('oops');\n"
    });

    let report = await runDoctor({ cwd, json: true });
    expect(report!.totalsBySeverity.error).toBeGreaterThanOrEqual(1);
    expect(report!.totalsBySeverity.warn).toBeGreaterThanOrEqual(0);
    expect(report!.totalsBySeverity.info).toBeGreaterThanOrEqual(0);
  });
});
