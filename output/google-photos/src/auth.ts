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
    name: 'Google OAuth',
    key: 'google_oauth',

    scopes: [
      {
        title: 'Picker Read',
        description: 'Create, get, and delete picker sessions, and list media items for sessions.',
        scope: 'https://www.googleapis.com/auth/photospicker.mediaitems.readonly',
      },
      {
        title: 'Library Upload',
        description: 'Upload media items and create albums. Only allows new media to be created in the user\'s library and in albums created by the app.',
        scope: 'https://www.googleapis.com/auth/photoslibrary.appendonly',
      },
      {
        title: 'Library Read',
        description: 'Read access to media items and albums created by the app.',
        scope: 'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata',
      },
      {
        title: 'Library Edit',
        description: 'Edit albums and media items created by the app, including organizing items, changing album titles/cover photos, and media descriptions.',
        scope: 'https://www.googleapis.com/auth/photoslibrary.edit.appcreateddata',
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
      let axios = createAxios();

      let response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code: ctx.code,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      let data = response.data;

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

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

      let axios = createAxios();

      let response = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          refresh_token: ctx.output.refreshToken,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'refresh_token',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      let data = response.data;

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string; refreshToken?: string; expiresAt?: string }; input: {}; scopes: string[] }) => {
      let axios = createAxios();

      let response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let data = response.data;

      return {
        profile: {
          id: data.id,
          email: data.email,
          name: data.name,
          imageUrl: data.picture,
        },
      };
    },
  });
