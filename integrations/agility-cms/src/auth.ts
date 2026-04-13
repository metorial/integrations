import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let mgmtBaseUrls: Record<string, string> = {
  usa: 'https://mgmt.aglty.io',
  usa2: 'https://mgmt-usa2.aglty.io',
  canada: 'https://mgmt-ca.aglty.io',
  europe: 'https://mgmt-eu.aglty.io',
  australia: 'https://mgmt-aus.aglty.io'
};

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string().describe('API key or OAuth access token for authenticating requests'),
      refreshToken: z.string().optional().describe('OAuth refresh token for token renewal'),
      expiresAt: z
        .string()
        .optional()
        .describe('ISO 8601 timestamp when the access token expires'),
      authMethod: z
        .enum(['api_key', 'oauth'])
        .describe('Which authentication method is in use')
    })
  )
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',

    inputSchema: z.object({
      apiKey: z
        .string()
        .describe('Agility CMS API Key (fetch or preview). Found in Settings > API Keys.')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.apiKey,
          authMethod: 'api_key' as const
        }
      };
    }
  })
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'OpenID',
        description: 'OpenID Connect authentication',
        scope: 'openid'
      },
      {
        title: 'Profile',
        description: 'Access to user profile information',
        scope: 'profile'
      },
      {
        title: 'Email',
        description: 'Access to user email address',
        scope: 'email'
      },
      {
        title: 'Offline Access',
        description: 'Enable refresh token for offline access',
        scope: 'offline_access'
      }
    ],

    inputSchema: z.object({
      region: z
        .enum(['usa', 'usa2', 'canada', 'europe', 'australia'])
        .default('usa')
        .describe('Hosting region for the Management API')
    }),

    getAuthorizationUrl: async ctx => {
      let baseUrl = mgmtBaseUrls[ctx.input.region] || mgmtBaseUrls.usa;
      let params = new URLSearchParams({
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        scope: ctx.scopes.join(' ')
      });

      return {
        url: `${baseUrl}/oauth/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let baseUrl = mgmtBaseUrls[ctx.input.region] || mgmtBaseUrls.usa;
      let httpClient = createAxios({ baseURL: baseUrl });

      let response = await httpClient.post('/oauth/token', {
        code: ctx.code,
        redirect_uri: ctx.redirectUri
      });

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          authMethod: 'oauth' as const
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let baseUrl = mgmtBaseUrls[ctx.input.region] || mgmtBaseUrls.usa;
      let httpClient = createAxios({ baseURL: baseUrl });

      let response = await httpClient.post('/oauth/refresh', {
        refresh_token: ctx.output.refreshToken
      });

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
          authMethod: 'oauth' as const
        },
        input: ctx.input
      };
    }
  });
