import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
  }))
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',
    inputSchema: z.object({
      apiKey: z.string().describe('Google Maps Platform API key with Address Validation API enabled'),
    }),
    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.apiKey,
        },
      };
    },
  })
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth',
    scopes: [
      {
        title: 'Cloud Platform',
        description: 'Full access to Google Cloud Platform services including Address Validation',
        scope: 'https://www.googleapis.com/auth/cloud-platform',
      },
    ],
    inputSchema: z.object({
      clientId: z.string().optional(),
      clientSecret: z.string().optional(),
    }),
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
      let axiosInstance = createAxios();

      let response = await axiosInstance.post('https://oauth2.googleapis.com/token', {
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code',
      });

      return {
        output: {
          token: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresAt: response.data.expires_in
            ? new Date(Date.now() + response.data.expires_in * 1000).toISOString()
            : undefined,
        },
      };
    },
    handleTokenRefresh: async (ctx) => {
      let axiosInstance = createAxios();

      let response = await axiosInstance.post('https://oauth2.googleapis.com/token', {
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'refresh_token',
      });

      return {
        output: {
          token: response.data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt: response.data.expires_in
            ? new Date(Date.now() + response.data.expires_in * 1000).toISOString()
            : undefined,
        },
      };
    },
  });
