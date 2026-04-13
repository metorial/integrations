import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let authAxios = createAxios({
  baseURL: 'https://auth.calendly.com'
});

let apiAxios = createAxios({
  baseURL: 'https://api.calendly.com'
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
    userUri: z.string().optional(),
    organizationUri: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Default',
        description: 'Full access based on authenticated user role (user or admin/owner)',
        scope: 'default'
      }
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state
      });

      return {
        url: `https://auth.calendly.com/oauth/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx) => {
      let response = await authAxios.post('/oauth/token', {
        grant_type: 'authorization_code',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        redirect_uri: ctx.redirectUri
      });

      let tokenData = response.data;
      let expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      let userResponse = await apiAxios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });

      let user = userResponse.data.resource;

      return {
        output: {
          token: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt,
          userUri: user.uri,
          organizationUri: user.current_organization
        }
      };
    },

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let response = await authAxios.post('/oauth/token', {
        grant_type: 'refresh_token',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken
      });

      let tokenData = response.data;
      let expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      return {
        output: {
          ...ctx.output,
          token: tokenData.access_token,
          refreshToken: tokenData.refresh_token ?? ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await apiAxios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data.resource;

      return {
        profile: {
          id: user.uri,
          email: user.email,
          name: user.name,
          imageUrl: user.avatar_url,
          schedulingUrl: user.scheduling_url,
          timezone: user.timezone
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'personal_access_token',

    inputSchema: z.object({
      token: z.string().describe('Personal access token from Calendly Integrations page (API & Webhooks)')
    }),

    getOutput: async (ctx) => {
      let response = await apiAxios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${ctx.input.token}`
        }
      });

      let user = response.data.resource;

      return {
        output: {
          token: ctx.input.token,
          userUri: user.uri,
          organizationUri: user.current_organization
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await apiAxios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data.resource;

      return {
        profile: {
          id: user.uri,
          email: user.email,
          name: user.name,
          imageUrl: user.avatar_url,
          schedulingUrl: user.scheduling_url,
          timezone: user.timezone
        }
      };
    }
  });
