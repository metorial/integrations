import {
  SlateAuthenticationMethod,
  SlatesAction,
  SlatesParticipant,
  slatesRequestsByMethod,
  slatesResponsesByMethod
} from '@slates/proto';
import { randomUUID } from 'crypto';
import z from 'zod';
import { SlateProtocolError } from './error';
import { SlatesClientState, SlatesProtocolClientOptions } from './types';

let createDefaultParticipants = (): SlatesParticipant[] => [
  {
    type: 'consumer',
    id: 'slates-client',
    name: 'Slates Client'
  }
];

export class SlatesProtocolClient {
  readonly transport: SlatesProtocolClientOptions['transport'];
  state: SlatesClientState;

  constructor(opts: SlatesProtocolClientOptions) {
    this.transport = opts.transport;
    this.state = {
      protocol: 'slates@2026-01-01',
      participants: opts.participants ?? createDefaultParticipants(),
      config: opts.state?.config ?? null,
      auth: opts.state?.auth ?? null,
      session: opts.state?.session ?? null
    };
  }

  setParticipants(participants: SlatesParticipant[]) {
    this.state.participants = participants;
    return this;
  }

  setConfig(config: Record<string, any> | null) {
    this.state.config = config;
    return this;
  }

  setAuth(auth: SlatesClientState['auth']) {
    this.state.auth = auth;
    return this;
  }

  clearAuth() {
    this.state.auth = null;
    return this;
  }

  setSession(session: SlatesClientState['session']) {
    this.state.session = session;
    return this;
  }

  ensureSession() {
    if (!this.state.session) {
      this.state.session = {
        id: randomUUID(),
        state: {}
      };
    }

    return this.state.session;
  }

  private buildStateMessages() {
    return [
      {
        jsonrpc: '2.0' as const,
        method: 'slates/hello' as const,
        params: { protocol: this.state.protocol }
      },
      {
        jsonrpc: '2.0' as const,
        method: 'slates/participant.set' as const,
        params: { participants: this.state.participants }
      },
      ...(this.state.config
        ? [
            {
              jsonrpc: '2.0' as const,
              method: 'slates/config.set' as const,
              params: { config: this.state.config }
            }
          ]
        : []),
      ...(this.state.auth
        ? [
            {
              jsonrpc: '2.0' as const,
              method: 'slates/auth.set' as const,
              params: {
                authenticationMethodId: this.state.auth.authenticationMethodId,
                output: this.state.auth.output
              }
            }
          ]
        : []),
      ...(this.state.session
        ? [
            {
              jsonrpc: '2.0' as const,
              method: 'slates/session.start' as const,
              params: {
                sessionId: this.state.session.id,
                state: this.state.session.state
              }
            }
          ]
        : [])
    ];
  }

  async request<Key extends keyof typeof slatesRequestsByMethod>(
    method: Key,
    params: z.infer<(typeof slatesRequestsByMethod)[Key]>['params']
  ): Promise<z.infer<(typeof slatesResponsesByMethod)[Key]>['result']> {
    let id = randomUUID();
    let responses = await this.transport.send([
      ...this.buildStateMessages(),
      {
        jsonrpc: '2.0',
        id,
        method,
        params
      } as z.infer<(typeof slatesRequestsByMethod)[Key]>
    ]);

    let response = responses.find(message => 'id' in message && message.id === id) as
      | { result?: any; error?: any }
      | undefined;

    if (!response) {
      throw new Error(`No response was returned for method ${String(method)}.`);
    }

    if (response.error) {
      throw SlateProtocolError.fromResponse(response.error);
    }

    return response.result;
  }

  async identify() {
    return this.request('slates/provider.identify', {});
  }

  async listActions() {
    return this.request('slates/actions.list', {});
  }

  async listTools(): Promise<SlatesAction[]> {
    let result = await this.listActions();
    return result.actions.filter(action => action.type === 'action.tool');
  }

  async getAction(actionId: string) {
    return this.request('slates/action.get', { actionId });
  }

  async getTool(actionId: string) {
    let result = await this.getAction(actionId);
    if (result.action.type !== 'action.tool') {
      throw new Error(`Action ${actionId} is not a tool.`);
    }

    return result.action;
  }

  async getConfigSchema() {
    return this.request('slates/config.schema.get', {});
  }

  async getDefaultConfig() {
    return this.request('slates/config.get_default', {});
  }

  async updateConfig(
    previousConfig: Record<string, any> | null,
    newConfig: Record<string, any>
  ) {
    return this.request('slates/config.changed', {
      previousConfig,
      newConfig
    });
  }

  async listAuthMethods(): Promise<{ authenticationMethods: SlateAuthenticationMethod[] }> {
    return this.request('slates/auth.methods.list', {});
  }

  async getAuthMethod(authenticationMethodId: string) {
    return this.request('slates/auth.method.get', {
      authenticationMethodId
    });
  }

  async getDefaultAuthInput(authenticationMethodId: string) {
    return this.request('slates/auth.input.get_default', {
      authenticationMethodId
    });
  }

  async updateAuthInput(d: {
    authenticationMethodId: string;
    previousInput: Record<string, any> | null;
    newInput: Record<string, any>;
  }) {
    return this.request('slates/auth.input.changed', {
      authenticationMethodId: d.authenticationMethodId,
      previousInput: d.previousInput,
      newInput: d.newInput
    });
  }

  async getAuthOutput(d: { authenticationMethodId: string; input: Record<string, any> }) {
    return this.request('slates/auth.output.get', {
      authenticationMethodId: d.authenticationMethodId,
      input: d.input
    });
  }

  async getAuthorizationUrl(d: {
    authenticationMethodId: string;
    redirectUri: string;
    state: string;
    input: Record<string, any>;
    clientId: string;
    clientSecret: string;
    scopes: string[];
  }) {
    return this.request('slates/auth.authorization_url.get', d);
  }

  async handleAuthorizationCallback(d: {
    authenticationMethodId: string;
    code: string;
    state: string;
    redirectUri: string;
    input: Record<string, any>;
    clientId: string;
    clientSecret: string;
    scopes: string[];
    callbackState?: Record<string, any>;
  }) {
    return this.request('slates/auth.authorization_callback.handle', d);
  }

  async refreshToken(d: {
    authenticationMethodId: string;
    output: Record<string, any>;
    input: Record<string, any>;
    clientId: string;
    clientSecret: string;
    scopes: string[];
  }) {
    return this.request('slates/auth.token_refresh.handle', d);
  }

  async getAuthProfile(d: {
    authenticationMethodId: string;
    output: Record<string, any>;
    input: Record<string, any>;
    scopes: string[];
  }) {
    return this.request('slates/auth.profile.get', d);
  }

  async invokeTool(actionId: string, input: Record<string, any>) {
    this.ensureSession();
    return this.request('slates/action.tool.invoke', {
      actionId,
      input
    });
  }

  async close() {
    await this.transport.close?.();
  }
}
