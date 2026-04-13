import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let googleOAuthAxios = createAxios({
  baseURL: 'https://oauth2.googleapis.com'
});

let googleUserInfoAxios = createAxios({
  baseURL: 'https://www.googleapis.com'
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Google OAuth',
    key: 'google_oauth',

    scopes: [
      {
        title: 'Documents',
        description: 'See, edit, create, and delete all Google Docs documents',
        scope: 'https://www.googleapis.com/auth/documents'
      },
      {
        title: 'Documents Read-only',
        description: 'See all Google Docs documents',
        scope: 'https://www.googleapis.com/auth/documents.readonly'
      },
      {
        title: 'Drive File',
        description: 'See, edit, create, and delete only specific Drive files used with the app (Recommended)',
        scope: 'https://www.googleapis.com/auth/drive.file'
      },
      {
        title: 'Drive',
        description: 'See, edit, create, and delete all Google Drive files',
        scope: 'https://www.googleapis.com/auth/drive'
      },
      {
        title: 'Drive Read-only',
        description: 'See and download all Google Drive files',
        scope: 'https://www.googleapis.com/auth/drive.readonly'
      },
      {
        title: 'User Profile',
        description: 'View your basic profile info',
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      },
      {
        title: 'User Email',
        description: 'View your email address',
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      }
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        access_type: 'offline',
        prompt: 'consent'
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      };
    },

    handleCallback: async (ctx) => {
      let response = await googleOAuthAxios.post('/token', new URLSearchParams({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        grant_type: 'authorization_code',
        redirect_uri: ctx.redirectUri
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
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
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let response = await googleOAuthAxios.post('/token', new URLSearchParams({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken,
        grant_type: 'refresh_token'
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: unknown; scopes: string[] }) => {
      let response = await googleUserInfoAxios.get('/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`
        }
      });

      let data = response.data;

      return {
        profile: {
          id: data.id,
          email: data.email,
          name: data.name,
          imageUrl: data.picture
        }
      };
    }
  });
