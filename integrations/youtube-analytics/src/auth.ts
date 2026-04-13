import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let googleOAuthAxios = createAxios({
  baseURL: 'https://oauth2.googleapis.com',
});

let youtubeDataAxios = createAxios({
  baseURL: 'https://www.googleapis.com/youtube/v3',
});

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
        title: 'Analytics Read-Only',
        description: 'View YouTube Analytics reports for your YouTube content',
        scope: 'https://www.googleapis.com/auth/yt-analytics.readonly',
      },
      {
        title: 'Analytics Monetary',
        description: 'View monetary and non-monetary YouTube Analytics reports for your YouTube content',
        scope: 'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      },
      {
        title: 'YouTube Manage',
        description: 'Manage your YouTube account (required for group management)',
        scope: 'https://www.googleapis.com/auth/youtube',
      },
      {
        title: 'YouTube Read-Only',
        description: 'View your YouTube account (required for reports.query)',
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
      },
      {
        title: 'YouTube Partner',
        description: 'View and manage your assets and associated content on YouTube',
        scope: 'https://www.googleapis.com/auth/youtubepartner',
      },
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state,
        scope: ctx.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent',
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      };
    },

    handleCallback: async (ctx) => {
      let response = await googleOAuthAxios.post('/token', new URLSearchParams({
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code',
      }).toString(), {
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
        throw new Error('No refresh token available');
      }

      let response = await googleOAuthAxios.post('/token', new URLSearchParams({
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'refresh_token',
      }).toString(), {
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
          refreshToken: ctx.output.refreshToken,
          expiresAt,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: Record<string, never>; scopes: string[] }) => {
      let response = await youtubeDataAxios.get('/channels', {
        params: {
          part: 'snippet,statistics',
          mine: true,
        },
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let channel = response.data.items?.[0];

      if (!channel) {
        return {
          profile: {},
        };
      }

      return {
        profile: {
          id: channel.id,
          name: channel.snippet?.title,
          imageUrl: channel.snippet?.thumbnails?.default?.url,
        },
      };
    },
  });
