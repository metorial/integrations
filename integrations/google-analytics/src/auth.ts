import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let googleOAuthAxios = createAxios({
  baseURL: 'https://oauth2.googleapis.com'
});

let googleUserInfoAxios = createAxios({
  baseURL: 'https://www.googleapis.com'
});

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z
        .string()
        .describe('OAuth 2.0 access token for Data API and Admin API requests.'),
      refreshToken: z
        .string()
        .optional()
        .describe('OAuth 2.0 refresh token for long-lived access.'),
      expiresAt: z
        .string()
        .optional()
        .describe('ISO 8601 timestamp when the access token expires.'),
      measurementId: z
        .string()
        .optional()
        .describe(
          'Measurement ID for web streams (e.g., "G-XXXXXXX"). Required for Measurement Protocol.'
        ),
      apiSecret: z
        .string()
        .optional()
        .describe('API secret for Measurement Protocol. Stream-specific.')
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth',

    scopes: [
      {
        title: 'Analytics Read-Only',
        description: 'Read-only access to Google Analytics data and configuration.',
        scope: 'https://www.googleapis.com/auth/analytics.readonly'
      },
      {
        title: 'Analytics Edit',
        description:
          'Edit access to Google Analytics configuration (also grants read access).',
        scope: 'https://www.googleapis.com/auth/analytics.edit'
      },
      {
        title: 'Manage Users',
        description: 'Manage user permissions on Analytics accounts and properties.',
        scope: 'https://www.googleapis.com/auth/analytics.manage.users'
      },
      {
        title: 'View User Permissions',
        description: 'View user permissions on Analytics accounts and properties.',
        scope: 'https://www.googleapis.com/auth/analytics.manage.users.readonly'
      },
      {
        title: 'User Profile',
        description: 'View basic profile information including email.',
        scope: 'openid email profile'
      }
    ],

    inputSchema: z.object({
      measurementId: z
        .string()
        .optional()
        .describe(
          'Measurement ID for web streams (e.g., "G-XXXXXXX"). Only needed for sending events via Measurement Protocol.'
        ),
      apiSecret: z
        .string()
        .optional()
        .describe('API secret for Measurement Protocol. Only needed for sending events.')
    }),

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state,
        scope: ctx.scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent'
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let response = await googleOAuthAxios.post(
        '/token',
        new URLSearchParams({
          code: ctx.code,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          measurementId: ctx.input.measurementId,
          apiSecret: ctx.input.apiSecret
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available. Please re-authenticate.');
      }

      let response = await googleOAuthAxios.post(
        '/token',
        new URLSearchParams({
          refresh_token: ctx.output.refreshToken,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'refresh_token'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt,
          measurementId: ctx.output.measurementId,
          apiSecret: ctx.output.apiSecret
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: any; scopes: string[] }) => {
      let response = await googleUserInfoAxios.get('/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
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
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Measurement Protocol Only',
    key: 'measurement_protocol',

    inputSchema: z.object({
      measurementId: z
        .string()
        .describe('Measurement ID for web streams (e.g., "G-XXXXXXX").'),
      apiSecret: z
        .string()
        .describe(
          'API secret for the Measurement Protocol. Generated in GA4 Admin > Data Streams.'
        )
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: '',
          measurementId: ctx.input.measurementId,
          apiSecret: ctx.input.apiSecret
        }
      };
    }
  });
