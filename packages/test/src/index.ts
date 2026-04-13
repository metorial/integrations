import { createVitestConfig } from '@lowerdeck/testing-tools';
import {
  createSlatesClientFromProfile,
  openSlatesCliStore,
  SlatesProfileRecord
} from '@slates/profiles';
import { readFile } from 'fs/promises';
import { expect } from 'vitest';

export interface SlatesRuntimeContext {
  integration: string | null;
  profileId: string | null;
  profile: SlatesProfileRecord | null;
  storePath: string;
  cliDir: string;
}

export let loadSlatesRuntimeContext = async (
  opts: {
    cwd?: string;
    profile?: string | null;
  } = {}
): Promise<SlatesRuntimeContext> => {
  let runtimeContextPath = process.env.SLATES_TEST_CONTEXT_PATH;
  if (runtimeContextPath) {
    let raw = await readFile(runtimeContextPath, 'utf-8');
    let parsed = JSON.parse(raw) as {
      integration?: string | null;
      profileId: string | null;
      storePath: string;
      cliDir: string;
    };
    let store = await openSlatesCliStore({ storePath: parsed.storePath });
    let profile = store.getProfile(opts.profile ?? parsed.profileId ?? null);

    return {
      integration: parsed.integration ?? store.scope?.key ?? null,
      profileId: profile?.id ?? parsed.profileId ?? null,
      profile,
      storePath: parsed.storePath,
      cliDir: parsed.cliDir
    };
  }

  let store = process.env.SLATES_STORE_PATH
    ? await openSlatesCliStore({ storePath: process.env.SLATES_STORE_PATH })
    : await openSlatesCliStore({ cwd: opts.cwd });
  let profileId = opts.profile ?? process.env.SLATES_PROFILE_ID ?? null;
  let profile = store.getProfile(profileId);

  return {
    integration: process.env.SLATES_INTEGRATION ?? store.scope?.key ?? null,
    profileId: profile?.id ?? null,
    profile,
    storePath: store.storePath,
    cliDir: store.dirPath
  };
};

export let loadSlatesProfile = async (
  opts: { cwd?: string; profile?: string | null } = {}
) => {
  let context = await loadSlatesRuntimeContext(opts);
  if (!context.profile) {
    throw new Error('No Slates profile is available for the current test context.');
  }

  return context.profile;
};

export let createSlatesTestClient = async (
  opts: { cwd?: string; profile?: string | null } = {}
) => {
  let profile = await loadSlatesProfile(opts);
  return createSlatesClientFromProfile(profile, { cwd: opts.cwd });
};

export let withSlateProfile = async <T>(
  profileName: string | null | undefined,
  cb: (ctx: { profile: SlatesProfileRecord }) => Promise<T>
) => {
  let profile = await loadSlatesProfile({ profile: profileName });
  return cb({ profile });
};

export let expectToolCall = async (d: {
  client?: Awaited<ReturnType<typeof createSlatesTestClient>>;
  profile?: string | null;
  toolId: string;
  input: Record<string, any>;
  output?: Record<string, any>;
}) => {
  let client = d.client ?? (await createSlatesTestClient({ profile: d.profile }));
  let result = await client.invokeTool(d.toolId, d.input);

  if (d.output) {
    expect(result.output).toMatchObject(d.output);
  }

  return result;
};

export let createSlatesVitestConfig = (
  config: Parameters<typeof createVitestConfig>[0] = {}
) => createVitestConfig(config);
