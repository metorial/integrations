import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';
import { getAccessTokenFromServiceAccount } from './lib/jwt';
import { firebaseScopes } from './scopes';

let googleOAuthAxios = createAxios({
  baseURL: 'https://oauth2.googleapis.com'
});

let googleUserInfoAxios = createAxios({
  baseURL: 'https://www.googleapis.com'
});

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Google OAuth',
    key: 'google_oauth',

    scopes: [
      {
        title: 'Cloud Platform',
        description:
          'Full access to Google Cloud Platform resources including Firestore, Cloud Messaging, Cloud Storage, Cloud Functions, and Remote Config',
        scope: firebaseScopes.cloudPlatform
      },
      {
        title: 'Realtime Database',
        description: 'Read and write access to Firebase Realtime Database',
        scope: firebaseScopes.firebaseDatabase
      },
      {
        title: 'User Email',
        description: 'View your email address (required for Realtime Database authentication)',
        scope: firebaseScopes.userInfoEmail
      },
      {
        title: 'User Profile',
        description: 'View your basic profile information',
        scope: firebaseScopes.userInfoProfile
      }
    ],

    getAuthorizationUrl: async ctx => {
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
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;
      let grantedScopes =
        typeof data.scope === 'string' ? data.scope.split(' ').filter(Boolean) : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        },
        scopes: grantedScopes
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
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

    getProfile: async (ctx: { output: { token: string }; input: {}; scopes: string[] }) => {
      let response = await googleUserInfoAxios.get('/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      return {
        profile: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          imageUrl: response.data.picture
        }
      };
    }
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Service Account Key',
    key: 'service_account',

    inputSchema: z.object({
      serviceAccountJson: z
        .string()
        .describe('Full JSON content of the Firebase service account key file')
    }),

    getOutput: async (ctx: { input: { serviceAccountJson: string } }) => {
      let serviceAccount: { client_email: string; private_key: string };
      try {
        serviceAccount = JSON.parse(ctx.input.serviceAccountJson);
      } catch {
        throw new Error('Invalid service account JSON format');
      }

      if (!serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error('Service account JSON must contain client_email and private_key');
      }

      let scopes = [
        firebaseScopes.cloudPlatform,
        firebaseScopes.firebaseDatabase,
        firebaseScopes.userInfoEmail
      ];

      let result = await getAccessTokenFromServiceAccount({
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
        scopes
      });

      return {
        output: {
          token: result.accessToken,
          expiresAt: result.expiresAt
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string };
      input: { serviceAccountJson: string };
    }) => {
      let response = await googleUserInfoAxios.get('/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      return {
        profile: {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          imageUrl: response.data.picture
        }
      };
    }
  });
