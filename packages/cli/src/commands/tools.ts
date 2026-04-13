import {
  chooseTool,
  createClientContext,
  ensureProfileConfig,
  syncProfileMetadata
} from '../lib/context';
import { parseJsonObject, promptForObjectSchema } from '../lib/prompts';
import { JsonInput, WithProfile } from '../lib/types';

export let listTools = async (opts: WithProfile) => {
  let { store, profile, client } = await createClientContext(opts.profile);
  let tools = await client.listTools();
  await syncProfileMetadata({ store, profile, client });
  return tools;
};

export let getTool = async (opts: WithProfile & { toolId?: string }) => {
  let { client } = await createClientContext(opts.profile);
  return chooseTool({ client, toolId: opts.toolId });
};

export let callTool = async (
  opts: WithProfile &
    JsonInput & {
      toolId?: string;
      authMethodId?: string;
    }
) => {
  let { store, profile, client } = await createClientContext(opts.profile);
  let tool = await chooseTool({ client, toolId: opts.toolId });

  await ensureProfileConfig({ store, profile, client });

  let storedAuth = store.getAuth(profile.id, opts.authMethodId);
  if (storedAuth) {
    client.setAuth({
      authenticationMethodId: storedAuth.authMethodId,
      output: storedAuth.output
    });
  }

  let toolInput =
    parseJsonObject(opts.input, 'tool input') ??
    (await promptForObjectSchema(tool.inputSchema, {}));

  let result = await client.invokeTool(tool.id, toolInput);
  store.setProfileSession(profile.id, client.state.session);
  await store.save();
  return result;
};
