import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createSlatesClientFromProfile } from './client';
import { afterEach, describe, expect, it } from 'vitest';
import { SlatesCliStore } from './store';

let tempDirs: string[] = [];

let createTempDir = async () => {
  let dir = await mkdtemp(path.join(tmpdir(), 'slates-profiles-'));
  tempDirs.push(dir);
  return dir;
};

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});

describe('@slates/profiles store', () => {
  it('creates a repo-local store with profiles and auth', async () => {
    let cwd = await createTempDir();
    let store = await SlatesCliStore.open({ cwd });

    let profile = store.upsertProfile({
      name: 'Demo',
      target: {
        type: 'local',
        entry: './fixtures/demo-slate.mjs',
        exportName: 'provider'
      }
    });

    store.setCurrentProfile(profile.id);
    store.setProfileConfig(profile.id, { prefix: 'Hello' });
    store.upsertAuth(profile.id, {
      authMethodId: 'token_auth',
      authType: 'auth.token',
      input: { token: 'abc' },
      output: { token: 'abc' },
      scopes: []
    });
    await store.save();

    let reopened = await SlatesCliStore.open({ cwd });
    let reopenedProfile = reopened.requireProfile(profile.id);

    expect(reopened.getProfile()?.id).toBe(profile.id);
    expect(reopenedProfile.config).toEqual({ prefix: 'Hello' });
    expect(reopened.getAuth(profile.id, 'token_auth')?.output).toEqual({ token: 'abc' });
  });

  it('creates a local client from a profile target', async () => {
    let cwd = await createTempDir();
    let entry = path.join(cwd, 'demo-slate.mjs');
    await writeFile(
      entry,
      `
import { Slate, SlateAuth, SlateConfig, SlateSpecification } from '@slates/provider';
import { z } from 'zod';

let config = SlateConfig.create(
  z.object({
    prefix: z.string().optional()
  })
).getDefaultConfig(() => ({}));

let auth = SlateAuth.create();

export let provider = Slate.create({
  spec: SlateSpecification.create({
    key: 'demo',
    name: 'Demo Slate',
    description: 'Local test slate',
    config,
    auth
  }),
  tools: [],
  triggers: []
});
`,
      'utf-8'
    );

    let store = await SlatesCliStore.open({ cwd });
    let profile = store.upsertProfile({
      name: 'Demo',
      target: {
        type: 'local',
        entry: './demo-slate.mjs',
        exportName: 'provider'
      }
    });

    let client = await createSlatesClientFromProfile(profile, { cwd });
    let provider = await client.identify();

    expect(provider.provider.id).toBe('demo');
    expect(provider.provider.name).toBe('Demo Slate');
  });
});
