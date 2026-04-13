import { select } from '@inquirer/prompts';
import { SlatesProtocolClient } from '@slates/client';
import {
  createSlatesClientFromProfile,
  openSlatesCliStore,
  SlatesProfileRecord
} from '@slates/profiles';
import { promptForObjectSchema } from './prompts';

export let chooseProfile = async (d: { profile?: string; message?: string }) => {
  let store = await openSlatesCliStore();
  if (d.profile) {
    return {
      store,
      profile: store.requireProfile(d.profile)
    };
  }

  let profiles = store.listProfiles();
  if (profiles.length === 0) {
    throw new Error('No Slates profiles found. Create one with `slates profiles add`.');
  }

  let current = store.getProfile();
  if (profiles.length === 1) {
    return {
      store,
      profile: profiles[0]!
    };
  }

  let profileId = await select({
    message: d.message ?? 'Choose a profile',
    default: current?.id,
    choices: profiles.map(profile => ({
      name: `${profile.name} (${profile.id})`,
      value: profile.id
    }))
  });

  return {
    store,
    profile: store.requireProfile(profileId)
  };
};

export let createClientContext = async (profileId?: string) => {
  let { store, profile } = await chooseProfile({ profile: profileId });
  let client = await createSlatesClientFromProfile(profile);
  return { store, profile, client };
};

export let syncProfileMetadata = async (d: {
  store: Awaited<ReturnType<typeof openSlatesCliStore>>;
  profile: SlatesProfileRecord;
  client: SlatesProtocolClient;
}) => {
  let [provider, actions] = await Promise.all([d.client.identify(), d.client.listActions()]);
  d.store.setProfileMetadata(d.profile.id, {
    provider: provider.provider,
    actions: actions.actions
  });
  await d.store.save();
};

export let ensureProfileConfig = async (d: {
  store: Awaited<ReturnType<typeof openSlatesCliStore>>;
  profile: SlatesProfileRecord;
  client: SlatesProtocolClient;
}) => {
  if (d.profile.config) {
    d.client.setConfig(d.profile.config);
    return d.profile.config;
  }

  let defaultConfig = (await d.client.getDefaultConfig()).config ?? {};
  let schema = (await d.client.getConfigSchema()).schema;
  let config = await promptForObjectSchema(schema, defaultConfig);
  d.store.setProfileConfig(d.profile.id, config);
  await d.store.save();
  d.client.setConfig(config);
  return config;
};

export let chooseTool = async (d: { client: SlatesProtocolClient; toolId?: string }) => {
  if (d.toolId) {
    return d.client.getTool(d.toolId);
  }

  let tools = await d.client.listTools();
  if (tools.length === 0) {
    throw new Error('This slate does not expose any tools.');
  }

  let toolId = await select({
    message: 'Choose a tool',
    choices: tools.map(tool => ({
      name: `${tool.name} (${tool.id})`,
      value: tool.id
    }))
  });

  return d.client.getTool(toolId);
};

export let chooseAuthMethod = async (d: {
  client: SlatesProtocolClient;
  authMethodId?: string;
}) => {
  let methods = (await d.client.listAuthMethods()).authenticationMethods;
  if (methods.length === 0) {
    throw new Error('This slate does not expose any authentication methods.');
  }

  if (d.authMethodId) {
    let method = methods.find(item => item.id === d.authMethodId);
    if (!method) {
      throw new Error(`Unknown auth method: ${d.authMethodId}`);
    }

    return method;
  }

  if (methods.length === 1) {
    return methods[0]!;
  }

  let methodId = await select({
    message: 'Choose an authentication method',
    choices: methods.map(method => ({
      name: `${method.name} (${method.type})`,
      value: method.id
    }))
  });

  return methods.find(method => method.id === methodId)!;
};
