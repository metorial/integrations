#!/usr/bin/env bun

import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'bun';

type PackageJson = Record<string, unknown> & {
  files?: unknown;
  main?: unknown;
  name?: unknown;
  version?: unknown;
};

type NpmPackFile = {
  path?: string;
};

type NpmPackResult = {
  files?: NpmPackFile[];
};

const DIST_ENTRY = 'dist/index.js';
const REQUIRED_FILES = [
  'dist/**',
  'src/**',
  'README.md',
  'docs/**',
  'logo.*',
  'slate.json',
  'tsconfig*.json'
] as const;
const HELP_TEXT = `
Usage:
  bun scripts/prepare-integration-package-for-publish.ts <package-directory>

Example:
  bun scripts/prepare-integration-package-for-publish.ts integrations/slack
`.trim();

async function main() {
  const packageDirectory = parseArgs(process.argv.slice(2));
  const packageJsonPath = path.join(packageDirectory, 'package.json');
  const packageJson = await readPackageJson(packageJsonPath);

  if (typeof packageJson.name !== 'string' || typeof packageJson.version !== 'string') {
    throw new Error(`Missing package name or version in ${packageJsonPath}.`);
  }

  await assertFileExists(path.join(packageDirectory, DIST_ENTRY));
  await updatePackageJsonForPublish(packageJsonPath, packageJson);
  await assertDistIsPacked(packageDirectory);

  console.error(`Prepared ${packageJson.name}@${packageJson.version} for npm publish.`);
}

function parseArgs(args: string[]): string {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const [packageDirectory, ...extraArgs] = args;

  if (!packageDirectory || extraArgs.length > 0) {
    throw new Error(HELP_TEXT);
  }

  const resolvedDirectory = path.resolve(process.cwd(), packageDirectory);
  const relativeDirectory = path.relative(process.cwd(), resolvedDirectory);

  if (
    relativeDirectory.startsWith('..') ||
    path.isAbsolute(relativeDirectory) ||
    (!relativeDirectory.startsWith('integrations/') &&
      !relativeDirectory.startsWith('test-integrations/'))
  ) {
    throw new Error(
      'Package directory must be inside integrations/ or test-integrations/.'
    );
  }

  return resolvedDirectory;
}

async function readPackageJson(packageJsonPath: string): Promise<PackageJson> {
  return JSON.parse(await readFile(packageJsonPath, 'utf8')) as PackageJson;
}

async function assertFileExists(filePath: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Expected build artifact does not exist: ${filePath}`);
  }
}

async function updatePackageJsonForPublish(
  packageJsonPath: string,
  packageJson: PackageJson
): Promise<void> {
  packageJson.main = DIST_ENTRY;
  packageJson.files = mergeFiles(packageJson.files, REQUIRED_FILES);

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function mergeFiles(existingFiles: unknown, requiredFiles: readonly string[]): string[] {
  if (existingFiles !== undefined && !Array.isArray(existingFiles)) {
    throw new Error('package.json files field must be an array when present.');
  }

  const files = new Set<string>();

  for (const file of requiredFiles) {
    files.add(file);
  }

  for (const file of existingFiles ?? []) {
    if (typeof file !== 'string') {
      throw new Error('package.json files field must only contain strings.');
    }

    files.add(file);
  }

  return [...files];
}

async function assertDistIsPacked(packageDirectory: string): Promise<void> {
  const result = await $`npm pack --dry-run --json`.cwd(packageDirectory).quiet().nothrow();
  const stdout = new TextDecoder().decode(result.stdout).trim();
  const stderr = new TextDecoder().decode(result.stderr).trim();

  if (result.exitCode !== 0) {
    throw new Error(
      `npm pack dry run failed: ${stderr || stdout || `exit code ${result.exitCode}`}`
    );
  }

  const packResults = JSON.parse(stdout) as NpmPackResult[];
  const packedFiles = new Set(
    packResults.flatMap(packResult =>
      (packResult.files ?? []).map(file => file.path).filter((file): file is string => !!file)
    )
  );

  if (!packedFiles.has(DIST_ENTRY)) {
    throw new Error(`npm pack dry run did not include ${DIST_ENTRY}.`);
  }
}

await main();
