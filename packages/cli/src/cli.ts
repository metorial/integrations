#!/usr/bin/env bun

import sade from 'sade';
import {
  addAuth,
  addProfile,
  callTool,
  getAuth,
  getConfig,
  getConfigSchema,
  getProfile,
  getTool,
  listAuth,
  listProfiles,
  listTools,
  refreshAuth,
  removeProfile,
  runVitestWithProfile,
  setConfig,
  startRepl,
  useProfile
} from './commands';

let printResult = async (cb: () => Promise<unknown>) => {
  try {
    let result = await cb();
    if (result !== undefined) {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

let cli = sade('slates');

cli
  .command('profiles add')
  .option('--name', 'Profile name')
  .option('--entry', 'Local slate entry file')
  .option('--export-name', 'Named export for the local slate provider')
  .option('--default', 'Use this profile as the default')
  .action(opts =>
    printResult(() =>
      addProfile({
        name: opts.name,
        entry: opts.entry,
        exportName: opts.exportName,
        useAsDefault: Boolean(opts.default)
      })
    )
  );

cli.command('profiles list').action(() => printResult(() => listProfiles()));

cli
  .command('profiles get [profile]')
  .action((profile: string | undefined) => printResult(() => getProfile(profile)));

cli
  .command('profiles use [profile]')
  .action((profile: string | undefined) => printResult(() => useProfile(profile)));

cli
  .command('profiles remove [profile]')
  .action((profile: string | undefined) => printResult(() => removeProfile(profile)));

cli
  .command('tools list')
  .option('--profile', 'Profile ID')
  .action(opts => printResult(() => listTools({ profile: opts.profile })));

cli
  .command('tools get [toolId]')
  .option('--profile', 'Profile ID')
  .action((toolId: string | undefined, opts) =>
    printResult(() => getTool({ profile: opts.profile, toolId }))
  );

cli
  .command('tools schema [toolId]')
  .option('--profile', 'Profile ID')
  .action((toolId: string | undefined, opts) =>
    printResult(async () => {
      let tool = await getTool({ profile: opts.profile, toolId });
      return tool.inputSchema;
    })
  );

cli
  .command('tools call [toolId]')
  .option('--profile', 'Profile ID')
  .option('--input', 'JSON input object')
  .option('--auth-method-id', 'Preferred auth method ID')
  .action((toolId: string | undefined, opts) =>
    printResult(() =>
      callTool({
        profile: opts.profile,
        toolId,
        input: opts.input,
        authMethodId: opts.authMethodId
      })
    )
  );

cli
  .command('auth list')
  .option('--profile', 'Profile ID')
  .action(opts => printResult(() => listAuth({ profile: opts.profile })));

cli
  .command('auth get [authMethodId]')
  .option('--profile', 'Profile ID')
  .action((authMethodId: string | undefined, opts) =>
    printResult(() => getAuth({ profile: opts.profile, authMethodId }))
  );

cli
  .command('auth add [authMethodId]')
  .option('--profile', 'Profile ID')
  .option('--input', 'JSON auth input object')
  .option('--client-id', 'OAuth client ID')
  .option('--client-secret', 'OAuth client secret')
  .option('--scopes', 'Comma-separated OAuth scopes')
  .action((authMethodId: string | undefined, opts) =>
    printResult(() =>
      addAuth({
        profile: opts.profile,
        authMethodId,
        input: opts.input,
        clientId: opts.clientId,
        clientSecret: opts.clientSecret,
        scopes: opts.scopes
      })
    )
  );

cli
  .command('auth refresh [authMethodId]')
  .option('--profile', 'Profile ID')
  .action((authMethodId: string | undefined, opts) =>
    printResult(() => refreshAuth({ profile: opts.profile, authMethodId }))
  );

cli
  .command('config get')
  .option('--profile', 'Profile ID')
  .action(opts => printResult(() => getConfig({ profile: opts.profile })));

cli
  .command('config set')
  .option('--profile', 'Profile ID')
  .option('--input', 'JSON config object')
  .action(opts => printResult(() => setConfig({ profile: opts.profile, input: opts.input })));

cli
  .command('config schema')
  .option('--profile', 'Profile ID')
  .action(opts => printResult(() => getConfigSchema({ profile: opts.profile })));

cli
  .command('test')
  .option('--profile', 'Profile ID')
  .action(opts =>
    printResult(async () => {
      let separatorIndex = process.argv.indexOf('--');
      await runVitestWithProfile({
        profile: opts.profile,
        vitestArgs: separatorIndex === -1 ? [] : process.argv.slice(separatorIndex + 1)
      });

      return { success: true };
    })
  );

cli
  .command('repl')
  .option('--profile', 'Profile ID')
  .action(opts => printResult(() => startRepl({ profile: opts.profile })));

cli.parse(process.argv);
