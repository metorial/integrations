import { openSlatesCliStore } from '@slates/profiles';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadSlatesRuntimeContext } from './index';

let tempDirs: string[] = [];

let createTempDir = async () => {
  let dir = await mkdtemp(path.join(tmpdir(), 'slates-test-'));
  tempDirs.push(dir);
  return dir;
};

afterEach(async () => {
  delete process.env.SLATES_PROFILE_ID;
  delete process.env.SLATES_TEST_CONTEXT_PATH;
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});

describe('@slates/test', () => {
  it('loads runtime context from the CLI handoff file', async () => {
    let cwd = await createTempDir();
    let store = await openSlatesCliStore({ cwd });
    let profile = store.upsertProfile({
      name: 'Demo',
      target: {
        type: 'local',
        entry: './demo-slate.mjs',
        exportName: 'provider'
      }
    });
    await store.save();

    let runtimeContextPath = path.join(cwd, 'runtime.json');
    await writeFile(
      runtimeContextPath,
      JSON.stringify({
        profileId: profile.id,
        storePath: store.storePath,
        cliDir: store.dirPath
      }),
      'utf-8'
    );

    process.env.SLATES_TEST_CONTEXT_PATH = runtimeContextPath;

    let context = await loadSlatesRuntimeContext({ cwd });
    expect(context.profileId).toBe(profile.id);
    expect(context.profile?.target.type).toBe('local');
    expect(context.storePath).toBe(store.storePath);
  });
});
