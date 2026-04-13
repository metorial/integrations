import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Read',
        description: 'Read access to your DigitalOcean resources',
        scope: 'read'
      },
      {
        title: 'Write',
        description: 'Write access to your DigitalOcean resources',
        scope: 'write'
      }
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state,
        scope: ctx.scopes.join(' ')
      });

      return {
        url: `https://cloud.digitalocean.com/v1/oauth/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx) => {
      let axios = createAxios();

      let response = await axios.post('https://cloud.digitalocean.com/v1/oauth/token', {
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
      let axios = createAxios();

      let response = await axios.post('https://cloud.digitalocean.com/v1/oauth/token', {
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
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: {}; scopes: string[] }) => {
      let axios = createAxios({
        baseURL: 'https://api.digitalocean.com/v2',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let response = await axios.get('/account');
      let account = response.data.account;

      return {
        profile: {
          id: account.uuid,
          email: account.email,
          name: account.name || account.email,
          team: account.team?.name
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'personal_access_token',

    inputSchema: z.object({
      token: z.string()
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: { token: string } }) => {
      let axios = createAxios({
        baseURL: 'https://api.digitalocean.com/v2',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let response = await axios.get('/account');
      let account = response.data.account;

      return {
        profile: {
          id: account.uuid,
          email: account.email,
          name: account.name || account.email,
          team: account.team?.name
        }
      };
    }
  });
