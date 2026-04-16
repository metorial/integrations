#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

type WorkspacePackage = {
  name: string;
  version: string;
};

type IntegrationPackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
};

type CliOptions = {
  packageFilters: string[];
  integrationFilters: string[];
  dryRun: boolean;
};

type PackageUpdate = {
  dependencyName: string;
  from: string;
  to: string;
  section: DependencySection;
};

type ManifestUpdate = {
  directory: string;
  kind: 'package' | 'integration';
  packageName: string;
  updates: PackageUpdate[];
};

const ROOT_DIRECTORY = path.resolve(import.meta.dir, '..');
const PACKAGES_DIRECTORY = path.join(ROOT_DIRECTORY, 'packages');
const INTEGRATION_DIRECTORIES = [
  path.join(ROOT_DIRECTORY, 'integrations'),
  path.join(ROOT_DIRECTORY, 'test-integrations')
] as const;
const DEPENDENCY_SECTIONS: DependencySection[] = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
];
const HELP_TEXT = `
Usage:
  bun scripts/update-integration-package-versions.ts [options]

Options:
  --package <name>       Update only matching workspace package names.
                         Repeat the flag or provide a comma-separated list.
  --integration <name>   Update only matching integration package names.
                         Repeat the flag or provide a comma-separated list.
  --dry-run              Print the planned updates without writing files.
  --help, -h             Show this help text.

Examples:
  bun scripts/update-integration-package-versions.ts --package slates,@slates/test
  bun scripts/update-integration-package-versions.ts --package @slates/* --dry-run
  bun scripts/update-integration-package-versions.ts --package slates --integration @slates-integrations/google-*
`.trim();

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const workspacePackages = await getWorkspacePackages();
  const selectedPackages = workspacePackages.filter(pkg =>
    matchesAnyFilter(pkg.name, options.packageFilters)
  );

  if (selectedPackages.length === 0) {
    const scopeDescription =
      options.packageFilters.length === 0
        ? 'the packages workspace'
        : `filters: ${options.packageFilters.join(', ')}`;
    throw new Error(`No workspace packages matched ${scopeDescription}.`);
  }

  const selectedPackageNames = new Set(selectedPackages.map(pkg => pkg.name));
  const latestVersions = new Map(selectedPackages.map(pkg => [pkg.name, pkg.version]));
  const manifestTargets = await getManifestTargets();
  const updates: ManifestUpdate[] = [];

  for (const target of manifestTargets) {
    const packageJsonPath = path.join(target.directory, 'package.json');
    const raw = await readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(raw) as IntegrationPackageJson;
    const packageName = packageJson.name ?? path.basename(target.directory);

    if (
      target.kind === 'integration' &&
      !matchesAnyFilter(packageName, options.integrationFilters)
    ) {
      continue;
    }

    const manifestUpdates = updateDependencySections(packageJson, latestVersions);
    if (manifestUpdates.length === 0) {
      continue;
    }

    const touchedPackageNames = new Set(manifestUpdates.map(update => update.dependencyName));
    if (![...touchedPackageNames].some(name => selectedPackageNames.has(name))) {
      continue;
    }

    updates.push({
      directory: target.directory,
      kind: target.kind,
      packageName,
      updates: manifestUpdates
    });

    if (!options.dryRun) {
      await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
    }
  }

  if (updates.length === 0) {
    console.error('No workspace dependencies needed updating.');
    return;
  }

  for (const manifest of updates) {
    console.error(
      `${options.dryRun ? 'Would update' : 'Updated'} ${manifest.packageName} (${manifest.kind}):`
    );
    for (const update of manifest.updates) {
      console.error(`  ${update.section} ${update.dependencyName}: ${update.from} -> ${update.to}`);
    }
  }

  const totalDependencyUpdates = updates.reduce((sum, manifest) => sum + manifest.updates.length, 0);
  const packageManifestCount = updates.filter(update => update.kind === 'package').length;
  const integrationManifestCount = updates.filter(update => update.kind === 'integration').length;
  console.error(
    `${options.dryRun ? 'Planned' : 'Applied'} ${totalDependencyUpdates} dependency update${
      totalDependencyUpdates === 1 ? '' : 's'
    } across ${updates.length} manifest${updates.length === 1 ? '' : 's'} (${packageManifestCount} package${
      packageManifestCount === 1 ? '' : 's'
    }, ${integrationManifestCount} integration${integrationManifestCount === 1 ? '' : 's'}).`
  );
}

function parseArgs(args: string[]): CliOptions {
  const packageFilters: string[] = [];
  const integrationFilters: string[] = [];
  let dryRun = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--help' || argument === '-h') {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    if (argument === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (argument === '--package') {
      const value = args[index + 1];
      if (!value) {
        throw new Error('Missing value for --package.');
      }
      packageFilters.push(...splitFilters(value));
      index += 1;
      continue;
    }

    if (argument.startsWith('--package=')) {
      packageFilters.push(...splitFilters(argument.slice('--package='.length)));
      continue;
    }

    if (argument === '--integration') {
      const value = args[index + 1];
      if (!value) {
        throw new Error('Missing value for --integration.');
      }
      integrationFilters.push(...splitFilters(value));
      index += 1;
      continue;
    }

    if (argument.startsWith('--integration=')) {
      integrationFilters.push(...splitFilters(argument.slice('--integration='.length)));
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return {
    packageFilters: packageFilters.filter(Boolean),
    integrationFilters: integrationFilters.filter(Boolean),
    dryRun
  };
}

function splitFilters(value: string): string[] {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

async function getWorkspacePackages(): Promise<WorkspacePackage[]> {
  const entries = await readdir(PACKAGES_DIRECTORY, { withFileTypes: true });
  const packages = await Promise.all(
    entries
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const packageJsonPath = path.join(PACKAGES_DIRECTORY, entry.name, 'package.json');
        const raw = await readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(raw) as { name?: string; version?: string };

        if (!packageJson.name || !packageJson.version) {
          throw new Error(`Missing name or version in ${packageJsonPath}.`);
        }

        return {
          name: packageJson.name,
          version: packageJson.version
        } satisfies WorkspacePackage;
      })
  );

  return packages.sort((left, right) => left.name.localeCompare(right.name));
}

async function getManifestTargets(): Promise<Array<{ directory: string; kind: 'package' | 'integration' }>> {
  const [packageEntries, ...integrationEntryLists] = await Promise.all([
    readdir(PACKAGES_DIRECTORY, { withFileTypes: true }),
    ...INTEGRATION_DIRECTORIES.map(dir => readdir(dir, { withFileTypes: true }))
  ]);

  const integrationTargets = INTEGRATION_DIRECTORIES.flatMap((dir, index) =>
    integrationEntryLists[index]
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        directory: path.join(dir, entry.name),
        kind: 'integration' as const
      }))
  );

  return [
    ...packageEntries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        directory: path.join(PACKAGES_DIRECTORY, entry.name),
        kind: 'package' as const
      })),
    ...integrationTargets
  ].sort((left, right) => left.directory.localeCompare(right.directory));
}

function updateDependencySections(
  packageJson: IntegrationPackageJson,
  latestVersions: Map<string, string>
): PackageUpdate[] {
  const updates: PackageUpdate[] = [];

  for (const section of DEPENDENCY_SECTIONS) {
    const dependencies = packageJson[section];
    if (!dependencies) continue;

    for (const [dependencyName, currentVersion] of Object.entries(dependencies)) {
      const latestVersion = latestVersions.get(dependencyName);
      if (!latestVersion || currentVersion === latestVersion) {
        continue;
      }

      dependencies[dependencyName] = latestVersion;
      updates.push({
        dependencyName,
        from: currentVersion,
        to: latestVersion,
        section
      });
    }
  }

  return updates;
}

function matchesAnyFilter(value: string, filters: string[]): boolean {
  if (filters.length === 0) {
    return true;
  }

  return filters.some(filter => wildcardToRegExp(filter).test(value));
}

function wildcardToRegExp(pattern: string): RegExp {
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escapedPattern}$`);
}

async function mainWithErrorHandling() {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

await mainWithErrorHandling();
