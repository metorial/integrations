import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Google OAuth 2.0',
    key: 'google_oauth',

    scopes: [
      {
        title: 'Cloud Platform',
        description: 'Full access to Google Cloud Platform resources including Speech-to-Text and Text-to-Speech APIs',
        scope: 'https://www.googleapis.com/auth/cloud-platform',
      },
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        access_type: 'offline',
        prompt: 'consent',
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      };
    },

    handleCallback: async (ctx) => {
      let http = createAxios({
        baseURL: 'https://oauth2.googleapis.com',
      });

      let response = await http.post('/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type: string;
      };

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
        throw new Error('No refresh token available');
      }

      let http = createAxios({
        baseURL: 'https://oauth2.googleapis.com',
      });

      let response = await http.post('/token', new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data as {
        access_token: string;
        expires_in?: number;
        token_type: string;
      };

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt,
        },
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string };
      input: Record<string, never>;
      scopes: string[];
    }) => {
      let http = createAxios({
        baseURL: 'https://www.googleapis.com',
      });

      let response = await http.get('/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let data = response.data as {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
      };

      return {
        profile: {
          id: data.sub,
          email: data.email,
          name: data.name,
          imageUrl: data.picture,
        },
      };
    },
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',

    inputSchema: z.object({
      apiKey: z.string().describe('Google Cloud API key with Speech API access enabled'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.apiKey,
        },
      };
    },
  });
