import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let getBaseUrl = (environment: string) =>
  environment === 'sandbox'
    ? 'https://gateway.remote-sandbox.com'
    : 'https://gateway.remote.com';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth',

    scopes: [
      {
        title: 'Company Manage',
        description: 'Full access to manage company data and employments',
        scope: 'https://gateway.remote.com/company.manage',
      },
    ],

    inputSchema: z.object({
      environment: z.enum(['production', 'sandbox']).default('production').describe('Remote API environment'),
    }),

    getAuthorizationUrl: async (ctx) => {
      let baseUrl = getBaseUrl(ctx.input.environment ?? 'production');
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
      });
      if (ctx.scopes.length > 0) {
        params.set('scope', ctx.scopes.join(' '));
      }
      return {
        url: `${baseUrl}/auth/oauth2/authorize?${params.toString()}`,
        input: ctx.input,
      };
    },

    handleCallback: async (ctx) => {
      let baseUrl = getBaseUrl(ctx.input.environment ?? 'production');
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let http = createAxios({ baseURL: baseUrl });
      let response = await http.post('/auth/oauth2/token', 'grant_type=authorization_code&code=' + encodeURIComponent(ctx.code), {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
        },
        input: ctx.input,
      };
    },

    handleTokenRefresh: async (ctx) => {
      let baseUrl = getBaseUrl(ctx.input.environment ?? 'production');
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let http = createAxios({ baseURL: baseUrl });
      let response = await http.post('/auth/oauth2/token', 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(ctx.output.refreshToken ?? ''), {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token ?? ctx.output.refreshToken,
          expiresAt,
        },
        input: ctx.input,
      };
    },
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Token',
    key: 'api_token',

    inputSchema: z.object({
      apiToken: z.string().describe('Remote API token (starts with ra_live or ra_test)'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.apiToken,
        },
      };
    },
  });
