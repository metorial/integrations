import {
  Slate,
  SlateAuth,
  SlateConfig,
  SlateSpecification,
  SlateTool
} from '@slates/provider';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createLocalSlateTransport, createSlatesClient, SlateProtocolError } from './index';

let tempDirs: string[] = [];

let createTempDir = async () => {
  let dir = await mkdtemp(path.join(tmpdir(), 'slates-client-'));
  tempDirs.push(dir);
  return dir;
};

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })));
});

let createDemoSlate = () => {
  let demoConfig = SlateConfig.create(
    z.object({
      prefix: z.string()
    })
  ).getDefaultConfig(() => ({
    prefix: 'Hello'
  }));

  let demoAuth = SlateAuth.create<{ token: string }>()
    .output(
      z.object({
        token: z.string()
      })
    )
    .addTokenAuth({
      type: 'auth.token',
      key: 'token_auth',
      name: 'Token Auth',
      inputSchema: z.object({
        token: z.string()
      }),
      getDefaultInput: async () => ({
        token: 'default-token'
      }),
      onInputChanged: async (ctx: { newInput: { token: string } }) => ({
        input: {
          token: ctx.newInput.token.trim()
        }
      }),
      getOutput: async (ctx: { input: { token: string } }) => ({
        output: {
          token: ctx.input.token
        }
      }),
      getProfile: async (ctx: { output: { token: string } }) => ({
        profile: {
          tokenPreview: ctx.output.token.slice(0, 3)
        }
      })
    });

  let spec = SlateSpecification.create({
    key: 'demo-slate',
    name: 'Demo Slate',
    description: 'A tiny test slate',
    config: demoConfig,
    auth: demoAuth
  });

  let echoTool = SlateTool.create(spec, {
    key: 'echo',
    name: 'Echo'
  })
    .input(
      z.object({
        name: z.string()
      })
    )
    .output(
      z.object({
        greeting: z.string(),
        token: z.string()
      })
    )
    .scopes({
      AND: [
        {
          OR: ['scope:echo', 'scope:echo:admin']
        }
      ]
    })
    .handleInvocation(async ctx => ({
      output: {
        greeting: `${ctx.config.prefix} ${ctx.input.name}`,
        token: ctx.auth.token
      },
      message: 'done'
    }))
    .build();

  return Slate.create({
    spec,
    tools: [echoTool],
    triggers: []
  });
};

describe('@slates/client local transport', () => {
  it('discovers auth/config and invokes tools with session state', async () => {
    let slate = createDemoSlate();
    let client = createSlatesClient({
      transport: createLocalSlateTransport({ slate })
    });

    let provider = await client.identify();
    expect(provider.provider.id).toBe('demo-slate');

    let actions = await client.listTools();
    expect(actions).toHaveLength(1);
    expect(actions[0]!.id).toBe('echo');
    expect(actions[0]!.scopes).toEqual({
      AND: [
        {
          OR: ['scope:echo', 'scope:echo:admin']
        }
      ]
    });

    let configSchema = await client.getConfigSchema();
    expect(configSchema.schema.properties.prefix.type).toBe('string');

    let defaultConfig = await client.getDefaultConfig();
    expect(defaultConfig.config).toEqual({ prefix: 'Hello' });

    let authMethods = await client.listAuthMethods();
    expect(authMethods.authenticationMethods).toHaveLength(1);
    expect(authMethods.authenticationMethods[0]!.type).toBe('auth.token');

    let defaultInput = await client.getDefaultAuthInput('token_auth');
    expect(defaultInput.input).toEqual({ token: 'default-token' });

    let changedInput = await client.updateAuthInput({
      authenticationMethodId: 'token_auth',
      previousInput: null,
      newInput: { token: '  trimmed-token  ' }
    });
    expect(changedInput.input).toEqual({ token: 'trimmed-token' });

    let authOutput = await client.getAuthOutput({
      authenticationMethodId: 'token_auth',
      input: changedInput.input ?? { token: '' }
    });
    expect(authOutput.output).toEqual({ token: 'trimmed-token' });

    client.setConfig({ prefix: 'Hi' });
    client.setAuth({
      authenticationMethodId: 'token_auth',
      output: authOutput.output
    });

    let result = await client.invokeTool('echo', { name: 'Tobias' });
    expect(result.output).toEqual({
      greeting: 'Hi Tobias',
      token: 'trimmed-token'
    });
    expect(client.state.session?.id).toBeTruthy();
  });

  it('throws structured protocol errors for provider responses', async () => {
    let client = createSlatesClient({
      transport: {
        async send(messages) {
          let request = messages.find(message => 'id' in message && message.id);
          return [
            {
              jsonrpc: '2.0',
              id: (request as { id: string }).id,
              error: {
                code: 'resource.not_found',
                kind: 'upstream',
                message: 'Resource contact_123 was not found',
                status: 404,
                provider: {
                  service: 'demo',
                  operation: 'failing.invoke'
                },
                baggage: {
                  resourceId: 'contact_123'
                }
              }
            } as any
          ];
        }
      }
    });

    let promise = client.identify();

    await expect(promise).rejects.toBeInstanceOf(SlateProtocolError);

    try {
      await promise;
    } catch (error) {
      expect(error).toBeInstanceOf(SlateProtocolError);
      expect((error as SlateProtocolError).data).toMatchObject({
        code: 'resource.not_found',
        kind: 'upstream',
        message: 'Resource contact_123 was not found',
        status: 404,
        provider: {
          service: 'demo',
          operation: 'failing.invoke'
        },
        baggage: {
          resourceId: 'contact_123'
        }
      });
    }
  });
});
