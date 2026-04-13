import { createLocalSlateTransport, createSlatesClient } from '@slates/client';
import path from 'path';
import { pathToFileURL } from 'url';
import { resolveSlatesCliRoot } from './store';
import { SlatesProfileRecord } from './types';

let resolveEntryPath = (entry: string, cwd?: string) => {
  if (path.isAbsolute(entry)) return entry;
  return path.resolve(resolveSlatesCliRoot(cwd), entry);
};

let loadSlateFromProfile = async (profile: SlatesProfileRecord, cwd?: string) => {
  if (profile.target.type !== 'local') {
    throw new Error(`Unsupported profile target type: ${(profile.target as any).type}`);
  }

  let modulePath = resolveEntryPath(profile.target.entry, cwd);
  let loaded = await import(pathToFileURL(modulePath).href);
  let exportName = profile.target.exportName;

  let slate =
    (exportName ? loaded[exportName] : undefined) ??
    loaded.provider ??
    loaded.slate ??
    loaded.default;

  if (!slate) {
    throw new Error(
      `Could not find a slate export in ${profile.target.entry}. Tried ${
        exportName ? `\`${exportName}\`, ` : ''
      }\`provider\`, \`slate\`, and \`default\`.`
    );
  }

  return slate;
};

export let createSlatesClientFromProfile = async (
  profile: SlatesProfileRecord,
  opts: { cwd?: string } = {}
) => {
  let firstAuth = Object.values(profile.auth)[0];
  let slate = await loadSlateFromProfile(profile, opts.cwd);

  return createSlatesClient({
    transport: createLocalSlateTransport({ slate }),
    state: {
      config: profile.config,
      session: profile.session,
      auth: firstAuth
        ? {
            authenticationMethodId: firstAuth.authMethodId,
            output: firstAuth.output
          }
        : null
    }
  });
};
