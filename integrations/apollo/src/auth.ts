import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional()
  }))
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',

    inputSchema: z.object({
      apiKey: z.string().describe('Apollo.io API key. Create one in Settings > Integrations > API Keys.')
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.apiKey
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { apiKey: string } }) => {
      let client = createAxios({
        baseURL: 'https://api.apollo.io/api/v1'
      });

      let response = await client.get('/users/api_profile', {
        headers: {
          'x-api-key': ctx.output.token
        }
      });

      let user = response.data;
      return {
        profile: {
          id: user.id,
          email: user.email,
          name: [user.first_name, user.last_name].filter(Boolean).join(' ') || undefined,
          imageUrl: user.image_url || undefined
        }
      };
    }
  })
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth',

    scopes: [
      {
        title: 'Read User Profile',
        description: 'Read basic user profile information',
        scope: 'read_user_profile'
      },
      {
        title: 'Contacts Search',
        description: 'Search for contacts in your Apollo account',
        scope: 'contacts_search'
      },
      {
        title: 'Person Read',
        description: 'Read person data from Apollo database',
        scope: 'person_read'
      },
      {
        title: 'Opportunity Write',
        description: 'Create and update deals/opportunities',
        scope: 'opportunity_write'
      }
    ],

    getAuthorizationUrl: async (ctx) => {
      let scopeString = ctx.scopes.join(' ');
      let url = `https://app.apollo.io/#/oauth/authorize?client_id=${encodeURIComponent(ctx.clientId)}&redirect_uri=${encodeURIComponent(ctx.redirectUri)}&response_type=code&scope=${encodeURIComponent(scopeString)}&state=${encodeURIComponent(ctx.state)}`;

      return { url };
    },

    handleCallback: async (ctx) => {
      let client = createAxios({
        baseURL: 'https://app.apollo.io/api/v1'
      });

      let response = await client.post('/oauth/token', {
        grant_type: 'authorization_code',
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    handleTokenRefresh: async (ctx) => {
      let client = createAxios({
        baseURL: 'https://app.apollo.io/api/v1'
      });

      let response = await client.post('/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: {}; scopes: string[] }) => {
      let client = createAxios({
        baseURL: 'https://api.apollo.io/api/v1'
      });

      let response = await client.get('/users/api_profile', {
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data;
      return {
        profile: {
          id: user.id,
          email: user.email,
          name: [user.first_name, user.last_name].filter(Boolean).join(' ') || undefined,
          imageUrl: user.image_url || undefined
        }
      };
    }
  });
