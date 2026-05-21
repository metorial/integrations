#!/usr/bin/env bun

import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { $ } from 'bun';

type PackageJson = Record<string, unknown> & {
  exports?: unknown;
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
const DIST_SOURCE_MAP_REGISTER = 'dist/sourcemap-register.cjs';
const REQUIRED_FILES = [
  'dist/**',
  'README.md',
  'docs/**',
  'logo.*',
  'slate.json'
] as const;
const HELP_TEXT = `
Usage:
  bun scripts/prepare-integration-package-for-publish.ts <package-directory>

Example:
  bun scripts/prepare-integration-package-for-publish.ts integrations/slack
`.trim();

async function main() {
  const packageDirectory = parseArgs(process.argv.slice(2));

  await prepareIntegrationPackageForPublish(packageDirectory);
}

export async function prepareIntegrationPackageForPublish(packageDirectory: string) {
  const packageJsonPath = path.join(packageDirectory, 'package.json');
  const packageJson = await readPackageJson(packageJsonPath);

  if (typeof packageJson.name !== 'string' || typeof packageJson.version !== 'string') {
    throw new Error(`Missing package name or version in ${packageJsonPath}.`);
  }

  await buildRuntimeArtifact(packageDirectory);
  await assertCleanDistEntrypoint(packageDirectory);
  await updatePackageJsonForPublish(packageJsonPath, packageJson);
  await assertPackedRuntimeShape(packageDirectory);

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

async function buildRuntimeArtifact(packageDirectory: string): Promise<void> {
  const result = await $`bunx @vercel/ncc build src/index.ts -o dist -m -s --no-source-map-register --transpile-only`
    .cwd(packageDirectory)
    .nothrow();

  if (result.exitCode !== 0) {
    const stdout = new TextDecoder().decode(result.stdout).trim();
    const stderr = new TextDecoder().decode(result.stderr).trim();
    throw new Error(
      `Runtime artifact build failed: ${stderr || stdout || `exit code ${result.exitCode}`}`
    );
  }
}

async function assertFileExists(filePath: string): Promise<void> {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Expected build artifact does not exist: ${filePath}`);
  }
}

export async function assertCleanDistEntrypoint(packageDirectory: string): Promise<void> {
  const distEntryPath = path.join(packageDirectory, DIST_ENTRY);
  await assertFileExists(distEntryPath);

  const distEntry = await readFile(distEntryPath, 'utf8');
  if (/['"]\.\/sourcemap-register\.cjs['"]/.test(distEntry)) {
    throw new Error(
      `${DIST_ENTRY} imports sourcemap-register.cjs. Build with --no-source-map-register before publishing.`
    );
  }
}

export async function updatePackageJsonForPublish(
  packageJsonPath: string,
  packageJson: PackageJson
): Promise<void> {
  packageJson.main = DIST_ENTRY;
  packageJson.exports = mergeExports(packageJson.exports);
  packageJson.files = mergeFiles(packageJson.files, REQUIRED_FILES);

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function mergeExports(existingExports: unknown): Record<string, unknown> {
  const runtimeExport = `./${DIST_ENTRY}`;

  if (existingExports === undefined || typeof existingExports === 'string') {
    return { '.': runtimeExport };
  }

  if (
    typeof existingExports !== 'object' ||
    existingExports === null ||
    Array.isArray(existingExports)
  ) {
    throw new Error('package.json exports field must be a string or object when present.');
  }

  return {
    ...existingExports,
    '.': runtimeExport
  };
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

    if (isSourceFilePattern(file) || file === DIST_SOURCE_MAP_REGISTER) {
      continue;
    }

    files.add(file);
  }

  return [...files];
}

function isSourceFilePattern(file: string): boolean {
  return file === 'src' || file === 'src/**' || file.startsWith('src/');
}

export async function assertPackedRuntimeShape(packageDirectory: string): Promise<void> {
  const npmCacheDir = await mkdtemp(path.join(tmpdir(), 'slates-npm-pack-cache-'));
  const result = await $`npm pack --dry-run --json`
    .cwd(packageDirectory)
    .env(getNpmPackEnv(npmCacheDir))
    .quiet()
    .nothrow();
  await rm(npmCacheDir, { recursive: true, force: true });
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

  if (packedFiles.has(DIST_SOURCE_MAP_REGISTER)) {
    throw new Error(`npm pack dry run included ${DIST_SOURCE_MAP_REGISTER}.`);
  }

  const sourceFiles = [...packedFiles].filter(file => file.startsWith('src/'));
  if (sourceFiles.length > 0) {
    throw new Error(`npm pack dry run included source files: ${sourceFiles.join(', ')}`);
  }
}

function getNpmPackEnv(npmCacheDir: string): Record<string, string> {
  let env: Record<string, string> = {};
  for (let [key, value] of Object.entries(process.env)) {
    if (typeof value == 'string') env[key] = value;
  }

  return {
    ...env,
    npm_config_cache: npmCacheDir
  };
}

if (import.meta.main) {
  await main();
}
