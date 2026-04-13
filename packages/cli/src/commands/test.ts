import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import { chooseProfile } from '../lib/context';
import { WithProfile } from '../lib/types';

export let runVitestWithProfile = async (opts: WithProfile & { vitestArgs: string[] }) => {
  let { store, profile } = await chooseProfile({ profile: opts.profile });
  let contextPath = path.join(store.dirPath, 'test-runtime.json');

  await writeFile(
    contextPath,
    JSON.stringify(
      {
        profileId: profile.id,
        storePath: store.storePath,
        cliDir: store.dirPath
      },
      null,
      2
    ) + '\n',
    'utf-8'
  );

  let command = process.execPath;
  let args = ['x', 'vitest', ...opts.vitestArgs];

  await new Promise<void>((resolve, reject) => {
    let child = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        SLATES_PROFILE_ID: profile.id,
        SLATES_CLI_DIR: store.dirPath,
        SLATES_STORE_PATH: store.storePath,
        SLATES_TEST_CONTEXT_PATH: contextPath
      }
    });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Vitest exited with code ${code ?? 1}.`));
    });
  });
};
