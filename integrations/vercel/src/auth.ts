import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let axiosInstance = createAxios({
  baseURL: 'https://api.vercel.com',
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Vercel OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'OpenID',
        description: 'Required for user identification via ID Token',
        scope: 'openid',
      },
      {
        title: 'Email',
        description: 'Access to the user\'s email address',
        scope: 'email',
      },
      {
        title: 'Profile',
        description: 'Access to the user\'s basic profile information',
        scope: 'profile',
      },
      {
        title: 'Offline Access',
        description: 'Issue a refresh token for long-lived access',
        scope: 'offline_access',
      },
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        code_challenge: ctx.state,
        code_challenge_method: 'S256',
      });

      return {
        url: `https://vercel.com/oauth/authorize?${params.toString()}`,
      };
    },

    handleCallback: async (ctx) => {
      let params = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        redirect_uri: ctx.redirectUri,
        code_verifier: ctx.state,
      });

      let response = await axiosInstance.post('/login/oauth/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
        },
      };
    },

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken,
      });

      let response = await axiosInstance.post('/login/oauth/token', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: {}; scopes: string[] }) => {
      let response = await axiosInstance.get('/v2/user', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let user = response.data.user;

      return {
        profile: {
          id: user.uid,
          email: user.email,
          name: user.name || user.username,
          imageUrl: user.avatar
            ? `https://api.vercel.com/www/avatar/${user.avatar}`
            : undefined,
          username: user.username,
        },
      };
    },
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Access Token',
    key: 'access_token',

    inputSchema: z.object({
      token: z.string().describe('Vercel Access Token (Bearer token)'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: { token: string } }) => {
      let response = await axiosInstance.get('/v2/user', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let user = response.data.user;

      return {
        profile: {
          id: user.uid,
          email: user.email,
          name: user.name || user.username,
          imageUrl: user.avatar
            ? `https://api.vercel.com/www/avatar/${user.avatar}`
            : undefined,
          username: user.username,
        },
      };
    },
  });
