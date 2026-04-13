import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let googleAxios = createAxios({
  baseURL: 'https://oauth2.googleapis.com'
});

let profileAxios = createAxios({
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
        title: 'Read-Only',
        description: 'Read all resources and their metadata—no modifications.',
        scope: 'https://www.googleapis.com/auth/gmail.readonly'
      },
      {
        title: 'Send',
        description: 'Send messages only. No read or modify access.',
        scope: 'https://www.googleapis.com/auth/gmail.send'
      },
      {
        title: 'Compose',
        description: 'Create, read, update, and delete drafts. Send messages and drafts.',
        scope: 'https://www.googleapis.com/auth/gmail.compose'
      },
      {
        title: 'Modify',
        description: 'All read/write operations except permanent deletion bypassing Trash.',
        scope: 'https://www.googleapis.com/auth/gmail.modify'
      },
      {
        title: 'Labels',
        description: 'Create, read, update, and delete labels only.',
        scope: 'https://www.googleapis.com/auth/gmail.labels'
      },
      {
        title: 'Insert',
        description: 'Insert and import messages only.',
        scope: 'https://www.googleapis.com/auth/gmail.insert'
      },
      {
        title: 'Metadata',
        description:
          'Read metadata including labels, history records, and email headers, but not the body or attachments.',
        scope: 'https://www.googleapis.com/auth/gmail.metadata'
      },
      {
        title: 'Basic Settings',
        description: 'Manage basic mail settings.',
        scope: 'https://www.googleapis.com/auth/gmail.settings.basic'
      },
      {
        title: 'Sharing Settings',
        description:
          'Manage sensitive mail settings including forwarding rules and aliases. Restricted to service accounts with domain-wide delegation.',
        scope: 'https://www.googleapis.com/auth/gmail.settings.sharing'
      },
      {
        title: 'Full Access',
        description:
          'Full access to the Gmail account including permanent deletion of threads and messages.',
        scope: 'https://mail.google.com/'
      },
      {
        title: 'User Profile',
        description: 'View your basic profile info including your email address.',
        scope: 'https://www.googleapis.com/auth/userinfo.email'
      },
      {
        title: 'User Profile Info',
        description: 'View your name and profile picture.',
        scope: 'https://www.googleapis.com/auth/userinfo.profile'
      }
    ],

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
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let response = await googleAxios.post(
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

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let response = await googleAxios.post(
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

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string };
      input: {};
      scopes: string[];
    }) => {
      let response = await profileAxios.get('/oauth2/v2/userinfo', {
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
  });
