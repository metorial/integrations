import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let netlifyApi = createAxios({
  baseURL: 'https://api.netlify.com',
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Full Access',
        description: 'Full access to the authenticated Netlify account',
        scope: 'full_access',
      },
    ],

    getAuthorizationUrl: async (ctx) => {
      let url = `https://app.netlify.com/authorize?client_id=${encodeURIComponent(ctx.clientId)}&response_type=code&state=${encodeURIComponent(ctx.state)}&redirect_uri=${encodeURIComponent(ctx.redirectUri)}`;
      return { url };
    },

    handleCallback: async (ctx) => {
      let response = await netlifyApi.post('/oauth/token', null, {
        params: {
          grant_type: 'authorization_code',
          code: ctx.code,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
        },
      });

      return {
        output: {
          token: response.data.access_token,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: {}; scopes: string[] }) => {
      let response = await netlifyApi.get('/api/v1/user', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let user = response.data;
      return {
        profile: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          imageUrl: user.avatar_url,
        },
      };
    },
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'pat',

    inputSchema: z.object({
      token: z.string().describe('Netlify Personal Access Token'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { token: string } }) => {
      let response = await netlifyApi.get('/api/v1/user', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let user = response.data;
      return {
        profile: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          imageUrl: user.avatar_url,
        },
      };
    },
  });
