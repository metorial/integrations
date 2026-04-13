import { SlatesStoredAuth } from '@slates/profiles';
import { chooseAuthMethod, createClientContext } from '../lib/context';
import { chooseScopes, createOAuthCallbackListener, openBrowser } from '../lib/oauth';
import {
  parseJsonObject,
  parseList,
  promptForObjectSchema,
  promptForString
} from '../lib/prompts';
import { JsonInput, WithProfile } from '../lib/types';

type JsonObject = Record<string, any>;

export let listAuth = async (opts: WithProfile) => {
  let { store, profile } = await createClientContext(opts.profile);
  return store.listAuth(profile.id);
};

export let getAuth = async (opts: WithProfile & { authMethodId?: string }) => {
  let { store, profile } = await createClientContext(opts.profile);
  return store.getAuth(profile.id, opts.authMethodId);
};

export let addAuth = async (
  opts: WithProfile &
    JsonInput & {
      authMethodId?: string;
      clientId?: string;
      clientSecret?: string;
      scopes?: string;
    }
): Promise<SlatesStoredAuth> => {
  let { store, profile, client } = await createClientContext(opts.profile);
  let authMethod = await chooseAuthMethod({
    client,
    authMethodId: opts.authMethodId
  });

  let defaultInput = authMethod.capabilities.getDefaultInput?.enabled
    ? ((await client.getDefaultAuthInput(authMethod.id)).input ?? {})
    : {};
  let authInput =
    parseJsonObject(opts.input, 'auth input') ??
    (await promptForObjectSchema(authMethod.inputSchema, defaultInput));

  if (authMethod.capabilities.handleChangedInput?.enabled) {
    authInput =
      (
        await client.updateAuthInput({
          authenticationMethodId: authMethod.id,
          previousInput: null,
          newInput: authInput
        })
      ).input ?? authInput;
  }

  let output: JsonObject;
  let finalInput = authInput;
  let callbackState: JsonObject | null = null;
  let scopes = parseList(opts.scopes);

  if (authMethod.type === 'auth.oauth') {
    let clientId = opts.clientId ?? (await promptForString({ message: 'OAuth client ID' }));
    let clientSecret =
      opts.clientSecret ??
      (await promptForString({ message: 'OAuth client secret', secret: true }));
    scopes = await chooseScopes(authMethod, scopes);

    let callback = await createOAuthCallbackListener();
    let authorizationUrl = await client.getAuthorizationUrl({
      authenticationMethodId: authMethod.id,
      redirectUri: callback.redirectUri,
      state: callback.state,
      input: authInput,
      clientId,
      clientSecret,
      scopes
    });

    callbackState = authorizationUrl.callbackState ?? null;
    finalInput = authorizationUrl.input ?? authInput;

    await openBrowser(authorizationUrl.authorizationUrl);
    let callbackResult = await callback.wait();
    if (callbackResult.state !== callback.state) {
      throw new Error('OAuth state mismatch.');
    }

    let authOutput = await client.handleAuthorizationCallback({
      authenticationMethodId: authMethod.id,
      code: callbackResult.code,
      state: callbackResult.state,
      redirectUri: callback.redirectUri,
      input: finalInput,
      clientId,
      clientSecret,
      scopes,
      callbackState: callbackState ?? undefined
    });

    output = authOutput.output;
    finalInput = authOutput.input ?? finalInput;

    let profileInfo = authMethod.capabilities.getProfile?.enabled
      ? await client.getAuthProfile({
          authenticationMethodId: authMethod.id,
          output,
          input: finalInput,
          scopes
        })
      : null;

    let stored = store.upsertAuth(profile.id, {
      authMethodId: authMethod.id,
      authMethodName: authMethod.name,
      authType: authMethod.type,
      input: finalInput,
      output,
      scopes,
      clientId,
      clientSecret,
      callbackState,
      profile: profileInfo?.profile ?? null
    });

    await store.save();
    return stored;
  }

  output = (
    await client.getAuthOutput({
      authenticationMethodId: authMethod.id,
      input: authInput
    })
  ).output;

  let profileInfo = authMethod.capabilities.getProfile?.enabled
    ? await client.getAuthProfile({
        authenticationMethodId: authMethod.id,
        output,
        input: finalInput,
        scopes
      })
    : null;

  let stored = store.upsertAuth(profile.id, {
    authMethodId: authMethod.id,
    authMethodName: authMethod.name,
    authType: authMethod.type,
    input: finalInput,
    output,
    scopes,
    profile: profileInfo?.profile ?? null
  });

  await store.save();
  return stored;
};

export let refreshAuth = async (opts: WithProfile & { authMethodId?: string }) => {
  let { store, profile, client } = await createClientContext(opts.profile);
  let storedAuth = store.getAuth(profile.id, opts.authMethodId);
  if (!storedAuth) {
    throw new Error('No stored authentication was found for this profile.');
  }

  let authMethod = await client.getAuthMethod(storedAuth.authMethodId);
  if (!authMethod.authenticationMethod.capabilities.handleTokenRefresh?.enabled) {
    throw new Error('This authentication method does not support token refresh.');
  }

  let refreshed = await client.refreshToken({
    authenticationMethodId: storedAuth.authMethodId,
    output: storedAuth.output,
    input: storedAuth.input,
    clientId: storedAuth.clientId ?? '',
    clientSecret: storedAuth.clientSecret ?? '',
    scopes: storedAuth.scopes
  });

  let updated = store.upsertAuth(profile.id, {
    ...storedAuth,
    input: refreshed.input ?? storedAuth.input,
    output: refreshed.output
  });
  await store.save();
  return updated;
};
