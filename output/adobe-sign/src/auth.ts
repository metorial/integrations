import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
    apiBaseUrl: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth',

    inputSchema: z.object({
      shard: z.string().default('na1').describe('Data center shard (e.g., na1, na2, eu1, au1, jp1)')
    }),

    scopes: [
      { title: 'Read Users', description: 'Read user information', scope: 'user_read:account' },
      { title: 'Write Users', description: 'Create and update users', scope: 'user_write:account' },
      { title: 'User Login', description: 'Login on behalf of a user', scope: 'user_login:self' },
      { title: 'Read Agreements', description: 'Read agreement details and status', scope: 'agreement_read:account' },
      { title: 'Write Agreements', description: 'Create and modify agreements', scope: 'agreement_write:account' },
      { title: 'Send Agreements', description: 'Send agreements for signature', scope: 'agreement_send:account' },
      { title: 'Agreement Retention', description: 'Delete agreement documents', scope: 'agreement_retention:account' },
      { title: 'Read Library Templates', description: 'Read library document templates', scope: 'library_read:account' },
      { title: 'Write Library Templates', description: 'Create and modify library templates', scope: 'library_write:account' },
      { title: 'Read Workflows', description: 'Read workflow details', scope: 'workflow_read:account' },
      { title: 'Write Workflows', description: 'Create and modify workflows', scope: 'workflow_write:account' },
      { title: 'Read Webhooks', description: 'Read webhook configurations', scope: 'webhook_read:account' },
      { title: 'Write Webhooks', description: 'Create and modify webhooks', scope: 'webhook_write:account' },
      { title: 'Webhook Retention', description: 'Delete webhooks', scope: 'webhook_retention:account' }
    ],

    getAuthorizationUrl: async (ctx) => {
      let shard = ctx.input?.shard || 'na1';
      let scopeString = ctx.scopes.join('+');
      let url = `https://secure.${shard}.adobesign.com/public/oauth/v2?response_type=code&client_id=${encodeURIComponent(ctx.clientId)}&redirect_uri=${encodeURIComponent(ctx.redirectUri)}&scope=${encodeURIComponent(scopeString)}&state=${encodeURIComponent(ctx.state)}`;

      return {
        url,
        input: { shard }
      };
    },

    handleCallback: async (ctx) => {
      let shard = ctx.input?.shard || 'na1';
      let tokenUrl = `https://api.${shard}.adobesign.com/oauth/v2/token`;

      let ax = createAxios({ baseURL: `https://api.${shard}.adobesign.com` });

      let tokenResponse = await ax.post('/oauth/v2/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      let data = tokenResponse.data;
      let expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

      // Retrieve the correct base URL for the user's account
      let baseUriResponse = await ax.get('/api/rest/v6/baseUris', {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });

      let apiBaseUrl = baseUriResponse.data.apiAccessPoint || `https://api.${shard}.adobesign.com/`;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          apiBaseUrl
        },
        input: { shard }
      };
    },

    handleTokenRefresh: async (ctx) => {
      let shard = ctx.input?.shard || 'na1';
      let ax = createAxios({ baseURL: `https://api.${shard}.adobesign.com` });

      let refreshResponse = await ax.post('/oauth/v2/refresh', new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken || '',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      let data = refreshResponse.data;
      let expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt,
          apiBaseUrl: ctx.output.apiBaseUrl
        },
        input: { shard }
      };
    },

    getProfile: async (ctx: any) => {
      let baseUrl = ctx.output.apiBaseUrl || 'https://api.na1.adobesign.com/';
      let ax = createAxios({ baseURL: baseUrl });

      let response = await ax.get('/api/rest/v6/users/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data;

      return {
        profile: {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          company: user.company
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Integration Key',
    key: 'integration_key',

    inputSchema: z.object({
      integrationKey: z.string().describe('Non-expiring integration key from Adobe Sign admin UI (for development/testing only)'),
      shard: z.string().default('na1').describe('Data center shard (e.g., na1, na2, eu1, au1, jp1)')
    }),

    getOutput: async (ctx) => {
      let shard = ctx.input.shard || 'na1';
      let ax = createAxios({ baseURL: `https://api.${shard}.adobesign.com` });

      // Retrieve the correct base URL
      let baseUriResponse = await ax.get('/api/rest/v6/baseUris', {
        headers: { Authorization: `Bearer ${ctx.input.integrationKey}` }
      });

      let apiBaseUrl = baseUriResponse.data.apiAccessPoint || `https://api.${shard}.adobesign.com/`;

      return {
        output: {
          token: ctx.input.integrationKey,
          apiBaseUrl
        }
      };
    },

    getProfile: async (ctx: any) => {
      let baseUrl = ctx.output.apiBaseUrl || 'https://api.na1.adobesign.com/';
      let ax = createAxios({ baseURL: baseUrl });

      let response = await ax.get('/api/rest/v6/users/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data;

      return {
        profile: {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          company: user.company
        }
      };
    }
  });
