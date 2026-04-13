#!/usr/bin/env bun

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'bun';

type IntegrationPackage = {
  directory: string;
  name: string;
  version: string;
};

type MatrixEntry = IntegrationPackage;

type MatrixOutput = {
  include: MatrixEntry[];
};

type CliOptions = {
  filters: string[];
};

const INTEGRATIONS_DIRECTORY = path.resolve(import.meta.dir, '..', 'integrations');
const HELP_TEXT = `
Usage:
  bun scripts/get-updated-integrations.ts [--filter <pattern>]

Options:
  --filter <pattern>   Filter package names with exact values or "*" wildcards.
                       Repeat the flag or provide a comma-separated list.

Examples:
  bun scripts/get-updated-integrations.ts
  bun scripts/get-updated-integrations.ts --filter @slates-integrations/google-*
  bun scripts/get-updated-integrations.ts --filter @slates-integrations/google-*,@slates-integrations/npm
`.trim();

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const integrations = await getIntegrationPackages();
  const matchingIntegrations = integrations.filter(integration =>
    matchesAnyFilter(integration.name, options.filters)
  );

  console.error(
    `Checking ${matchingIntegrations.length} integration package${matchingIntegrations.length === 1 ? '' : 's'} on npm...`
  );

  const unpublishedIntegrations = await filterUnpublishedIntegrations(
    matchingIntegrations,
    20
  );
  const output: MatrixOutput = {
    include: unpublishedIntegrations.sort((left, right) => left.name.localeCompare(right.name))
  };

  console.error(
    `Found ${output.include.length} unpublished integration version${output.include.length === 1 ? '' : 's'}.`
  );

  process.stdout.write(`${JSON.stringify(output)}\n`);
}

function parseArgs(args: string[]): CliOptions {
  const filters: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--help' || argument === '-h') {
      console.log(HELP_TEXT);
      process.exit(0);
    }

    if (argument === '--filter') {
      const value = args[index + 1];

      if (!value) {
        throw new Error('Missing value for --filter.');
      }

      filters.push(...splitFilters(value));
      index += 1;
      continue;
    }

    if (argument.startsWith('--filter=')) {
      filters.push(...splitFilters(argument.slice('--filter='.length)));
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return {
    filters: filters.filter(Boolean)
  };
}

function splitFilters(value: string): string[] {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

async function getIntegrationPackages(): Promise<IntegrationPackage[]> {
  const directoryEntries = await readdir(INTEGRATIONS_DIRECTORY, { withFileTypes: true });
  const packages = await Promise.all(
    directoryEntries
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const packageJsonPath = path.join(INTEGRATIONS_DIRECTORY, entry.name, 'package.json');
        const packageJsonRaw = await readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonRaw) as {
          name?: string;
          private?: boolean;
          version?: string;
        };

        if (packageJson.private) {
          return null;
        }

        if (!packageJson.name || !packageJson.version) {
          throw new Error(`Missing name or version in ${packageJsonPath}.`);
        }

        return {
          directory: path.posix.join('integrations', entry.name),
          name: packageJson.name,
          version: packageJson.version
        } satisfies IntegrationPackage;
      })
  );

  return packages.filter(
    (integration): integration is IntegrationPackage => integration !== null
  );
}

function matchesAnyFilter(packageName: string, filters: string[]): boolean {
  if (filters.length === 0) {
    return true;
  }

  return filters.some(filter => wildcardToRegExp(filter).test(packageName));
}

function wildcardToRegExp(pattern: string): RegExp {
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escapedPattern}$`);
}

async function filterUnpublishedIntegrations(
  integrations: IntegrationPackage[],
  concurrency: number
): Promise<IntegrationPackage[]> {
  const unpublished: IntegrationPackage[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < integrations.length) {
      const integration = integrations[cursor];
      cursor += 1;

      const isPublished = await hasPublishedVersion(integration);

      if (!isPublished) {
        unpublished.push(integration);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, integrations.length) }, () => worker())
  );

  return unpublished;
}

async function hasPublishedVersion(integration: IntegrationPackage): Promise<boolean> {
  const spec = `${integration.name}@${integration.version}`;
  const result = await $`npm view ${spec} version --json --loglevel=error`.quiet().nothrow();

  if (result.exitCode === 0) {
    console.error(`Published already: ${spec}`);
    return true;
  }

  const stderr = new TextDecoder().decode(result.stderr).trim();

  if (stderr.includes('E404') || stderr.includes('404 Not Found')) {
    console.error(`Needs publish: ${spec}`);
    return false;
  }

  throw new Error(
    `Failed to query npm for ${spec}: ${stderr || `exit code ${result.exitCode}`}`
  );
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
