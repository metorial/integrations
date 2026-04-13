import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let graphAxios = createAxios({
  baseURL: 'https://graph.microsoft.com/v1.0'
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
    name: 'Microsoft OAuth',
    key: 'microsoft_oauth',

    scopes: [
      {
        title: 'User Profile',
        description: 'Read signed-in user profile',
        scope: 'User.Read'
      },
      {
        title: 'Offline Access',
        description: 'Obtain refresh tokens for long-lived access',
        scope: 'offline_access'
      },
      {
        title: 'Read Teams',
        description: 'Read basic team properties',
        scope: 'Team.ReadBasic.All'
      },
      {
        title: 'Read Team Settings',
        description: 'Read team settings',
        scope: 'TeamSettings.Read.All'
      },
      {
        title: 'Read/Write Team Settings',
        description: 'Read and modify team settings',
        scope: 'TeamSettings.ReadWrite.All'
      },
      {
        title: 'Read Channels',
        description: 'Read basic channel properties',
        scope: 'Channel.ReadBasic.All'
      },
      {
        title: 'Create Channels',
        description: 'Create channels in teams',
        scope: 'Channel.Create'
      },
      {
        title: 'Delete Channels',
        description: 'Delete channels in teams',
        scope: 'Channel.Delete.All'
      },
      { title: 'Read Chats', description: 'Read user chat messages', scope: 'Chat.Read' },
      {
        title: 'Read/Write Chats',
        description: 'Read and send chat messages',
        scope: 'Chat.ReadWrite'
      },
      {
        title: 'Read Chat Messages',
        description: 'Read chat and channel messages',
        scope: 'ChatMessage.Read'
      },
      {
        title: 'Send Chat Messages',
        description: 'Send chat messages',
        scope: 'ChatMessage.Send'
      },
      {
        title: 'Read Channel Messages',
        description: 'Read messages in channels',
        scope: 'ChannelMessage.Read.All'
      },
      {
        title: 'Send Channel Messages',
        description: 'Send messages in channels',
        scope: 'ChannelMessage.Send'
      },
      {
        title: 'Read Online Meetings',
        description: 'Read online meeting details',
        scope: 'OnlineMeetings.Read'
      },
      {
        title: 'Read/Write Online Meetings',
        description: 'Create and manage online meetings',
        scope: 'OnlineMeetings.ReadWrite'
      },
      {
        title: 'Read Presence',
        description: 'Read user presence information',
        scope: 'Presence.Read.All'
      },
      {
        title: 'Read/Write Team Members',
        description: 'Read and manage team members',
        scope: 'TeamMember.ReadWrite.All'
      },
      {
        title: 'Read Group Members',
        description: 'Read group membership',
        scope: 'GroupMember.Read.All'
      },
      {
        title: 'Read/Write Group Members',
        description: 'Read and manage group membership',
        scope: 'GroupMember.ReadWrite.All'
      },
      {
        title: 'Read Directory',
        description: 'Read directory data',
        scope: 'Directory.Read.All'
      },
      {
        title: 'Read/Write Shifts',
        description: 'Read and write shift schedules',
        scope: 'Schedule.ReadWrite.All'
      },
      { title: 'Read Shifts', description: 'Read shift schedules', scope: 'Schedule.Read.All' }
    ],

    inputSchema: z.object({
      tenantId: z
        .string()
        .optional()
        .describe('Microsoft Entra tenant ID. Leave empty for multi-tenant (common).')
    }),

    getAuthorizationUrl: async ctx => {
      let tenant = ctx.input.tenantId || 'common';
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        response_mode: 'query'
      });

      return {
        url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let tenant = ctx.input.tenantId || 'common';
      let tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

      let body = new URLSearchParams({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        redirect_uri: ctx.redirectUri,
        grant_type: 'authorization_code',
        scope: ctx.scopes.join(' ')
      });

      let response = await graphAxios.post(tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let tenant = ctx.input.tenantId || 'common';
      let tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

      let body = new URLSearchParams({
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken,
        grant_type: 'refresh_token',
        scope: ctx.scopes.join(' ')
      });

      let response = await graphAxios.post(tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: any) => {
      let response = await graphAxios.get('/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data;

      return {
        profile: {
          id: user.id,
          email: user.mail || user.userPrincipalName,
          name: user.displayName
        }
      };
    }
  });
