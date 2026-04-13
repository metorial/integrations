import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let authAxios = createAxios({
  baseURL: 'https://zoom.us'
});

let apiAxios = createAxios({
  baseURL: 'https://api.zoom.us/v2'
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
    accountId: z.string().optional(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      // User scopes
      { title: 'Read Users', description: 'View user information', scope: 'user:read' },
      { title: 'Write Users', description: 'Create and manage users', scope: 'user:write' },
      { title: 'Read Users (Admin)', description: 'View all users as admin', scope: 'user:read:admin' },
      { title: 'Write Users (Admin)', description: 'Manage all users as admin', scope: 'user:write:admin' },
      { title: 'User Profile', description: 'View user profile information', scope: 'user_profile' },

      // Meeting scopes
      { title: 'Read Meetings', description: 'View meeting information', scope: 'meeting:read' },
      { title: 'Write Meetings', description: 'Create and manage meetings', scope: 'meeting:write' },
      { title: 'Read Meetings (Admin)', description: 'View all meetings as admin', scope: 'meeting:read:admin' },
      { title: 'Write Meetings (Admin)', description: 'Manage all meetings as admin', scope: 'meeting:write:admin' },

      // Webinar scopes
      { title: 'Read Webinars', description: 'View webinar information', scope: 'webinar:read' },
      { title: 'Write Webinars', description: 'Create and manage webinars', scope: 'webinar:write' },
      { title: 'Read Webinars (Admin)', description: 'View all webinars as admin', scope: 'webinar:read:admin' },
      { title: 'Write Webinars (Admin)', description: 'Manage all webinars as admin', scope: 'webinar:write:admin' },

      // Recording scopes
      { title: 'Read Recordings', description: 'View cloud recordings', scope: 'recording:read' },
      { title: 'Write Recordings', description: 'Manage cloud recordings', scope: 'recording:write' },
      { title: 'Read Recordings (Admin)', description: 'View all recordings as admin', scope: 'recording:read:admin' },
      { title: 'Write Recordings (Admin)', description: 'Manage all recordings as admin', scope: 'recording:write:admin' },

      // Chat scopes
      { title: 'Read Chat Messages', description: 'View chat messages', scope: 'chat_message:read' },
      { title: 'Write Chat Messages', description: 'Send and manage chat messages', scope: 'chat_message:write' },
      { title: 'Read Chat Messages (Admin)', description: 'View all chat messages as admin', scope: 'chat_message:read:admin' },
      { title: 'Write Chat Messages (Admin)', description: 'Manage all chat messages as admin', scope: 'chat_message:write:admin' },
      { title: 'Read Chat Channels', description: 'View chat channels', scope: 'chat_channel:read' },
      { title: 'Write Chat Channels', description: 'Manage chat channels', scope: 'chat_channel:write' },
      { title: 'Read Chat Channels (Admin)', description: 'View all chat channels as admin', scope: 'chat_channel:read:admin' },
      { title: 'Write Chat Channels (Admin)', description: 'Manage all chat channels as admin', scope: 'chat_channel:write:admin' },

      // Phone scopes
      { title: 'Read Phone', description: 'View Zoom Phone data', scope: 'phone:read' },
      { title: 'Write Phone', description: 'Manage Zoom Phone data', scope: 'phone:write' },
      { title: 'Read Phone (Admin)', description: 'View all Zoom Phone data as admin', scope: 'phone:read:admin' },
      { title: 'Write Phone (Admin)', description: 'Manage all Zoom Phone data as admin', scope: 'phone:write:admin' },

      // Report scopes
      { title: 'Read Reports', description: 'View usage reports and analytics', scope: 'report:read:admin' },

      // Dashboard scopes
      { title: 'Read Dashboard', description: 'View dashboard data', scope: 'dashboard_meetings:read:admin' },

      // Account scopes
      { title: 'Read Account', description: 'View account information', scope: 'account:read:admin' },
      { title: 'Write Account', description: 'Manage account settings', scope: 'account:write:admin' },
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        response_type: 'code',
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
      });

      if (ctx.scopes.length > 0) {
        params.set('scope', ctx.scopes.join(' '));
      }

      return {
        url: `https://zoom.us/oauth/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx) => {
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await authAxios.post('/oauth/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code: ctx.code,
        redirect_uri: ctx.redirectUri,
      }).toString(), {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
        }
      };
    },

    handleTokenRefresh: async (ctx) => {
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await authAxios.post('/oauth/token', new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken || '',
      }).toString(), {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string; accountId?: string };
      input: Record<string, never>;
      scopes: string[];
    }) => {
      let response = await apiAxios.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`,
        },
      });

      let user = response.data;

      return {
        profile: {
          id: user.id,
          email: user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          imageUrl: user.pic_url,
          accountId: user.account_id,
          type: user.type,
        }
      };
    },
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Server-to-Server OAuth',
    key: 'server_to_server_oauth',

    inputSchema: z.object({
      accountId: z.string().describe('Zoom Account ID'),
      clientId: z.string().describe('Client ID from Zoom App Marketplace'),
      clientSecret: z.string().describe('Client Secret from Zoom App Marketplace'),
    }),

    getOutput: async (ctx: {
      input: { accountId: string; clientId: string; clientSecret: string };
    }) => {
      let credentials = btoa(`${ctx.input.clientId}:${ctx.input.clientSecret}`);

      let response = await authAxios.post('/oauth/token', new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: ctx.input.accountId,
      }).toString(), {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          expiresAt,
          accountId: ctx.input.accountId,
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string; accountId?: string };
      input: { accountId: string; clientId: string; clientSecret: string };
    }) => {
      let response = await apiAxios.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`,
        },
      });

      let user = response.data;

      return {
        profile: {
          id: user.id,
          email: user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          imageUrl: user.pic_url,
          accountId: user.account_id,
        }
      };
    },
  });
