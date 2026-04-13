import { checkbox } from '@inquirer/prompts';
import { execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { createServer } from 'http';
import { promisify } from 'util';

let execFileAsync = promisify(execFile);

export let chooseScopes = async (
  authMethod: any,
  initialScopes: string[]
): Promise<string[]> => {
  let scopeIds = (authMethod.scopes ?? []).map((scope: any) => scope.id);
  if (scopeIds.length === 0) {
    return initialScopes;
  }

  return (await checkbox({
    message: 'Choose OAuth scopes',
    choices: authMethod.scopes.map((scope: any) => ({
      name: `${scope.title} (${scope.id})`,
      value: scope.id,
      checked: initialScopes.length > 0 ? initialScopes.includes(scope.id) : true
    }))
  })) as string[];
};

export let openBrowser = async (url: string) => {
  try {
    if (process.platform === 'darwin') {
      await execFileAsync('open', [url]);
      return;
    }

    if (process.platform === 'win32') {
      await execFileAsync('cmd', ['/c', 'start', '', url]);
      return;
    }

    await execFileAsync('xdg-open', [url]);
  } catch {
    console.log(`Open this URL in your browser:\n${url}`);
  }
};

export let createOAuthCallbackListener = async () => {
  return new Promise<{
    redirectUri: string;
    state: string;
    wait: () => Promise<{ code: string; state: string }>;
  }>((resolve, reject) => {
    let expectedState = randomUUID();
    let settled = false;

    let server = createServer((req, res) => {
      try {
        let url = new URL(req.url ?? '/', 'http://127.0.0.1');
        let code = url.searchParams.get('code');
        let state = url.searchParams.get('state');

        if (!code || !state) {
          res.statusCode = 400;
          res.end('Missing code or state.');
          return;
        }

        res.end('Authentication complete. You can close this window.');
        server.close();
        settled = true;
        waiter.resolve({ code, state });
      } catch (error) {
        server.close();
        settled = true;
        waiter.reject(error);
      }
    });

    let waiter = (() => {
      let resolvePromise!: (value: { code: string; state: string }) => void;
      let rejectPromise!: (error: unknown) => void;
      let promise = new Promise<{ code: string; state: string }>((resolveFn, rejectFn) => {
        resolvePromise = resolveFn;
        rejectPromise = rejectFn;
      });

      return {
        promise,
        resolve: resolvePromise,
        reject: rejectPromise
      };
    })();

    let timeout = setTimeout(
      () => {
        if (settled) return;
        server.close();
        waiter.reject(new Error('Timed out waiting for the OAuth callback.'));
      },
      5 * 60 * 1000
    );

    server.on('close', () => clearTimeout(timeout));

    server.listen(0, '127.0.0.1', () => {
      let address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Could not determine OAuth callback address.'));
        return;
      }

      resolve({
        redirectUri: `http://127.0.0.1:${address.port}/callback`,
        state: expectedState,
        wait: () => waiter.promise
      });
    });
  });
};
