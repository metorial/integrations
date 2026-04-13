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
    name: 'Microsoft OAuth',
    key: 'microsoft_oauth',

    scopes: [
      {
        title: 'Read Notes',
        description: 'Read-only access to all OneNote notebooks owned by or shared with you.',
        scope: 'Notes.Read',
      },
      {
        title: 'Read & Write Notes',
        description: 'Read and modify OneNote content.',
        scope: 'Notes.ReadWrite',
      },
      {
        title: 'Create Notes',
        description: 'Create new OneNote notebooks, sections, and pages.',
        scope: 'Notes.Create',
      },
      {
        title: 'Read All Notes',
        description: 'Read all OneNote notebooks you have access to in the organization.',
        scope: 'Notes.Read.All',
      },
      {
        title: 'Read & Write All Notes',
        description: 'Read, share, and modify all OneNote notebooks you have access to in the organization.',
        scope: 'Notes.ReadWrite.All',
      },
      {
        title: 'Offline Access',
        description: 'Obtain a refresh token for persistent access.',
        scope: 'offline_access',
      },
      {
        title: 'User Profile',
        description: 'Read your basic profile information.',
        scope: 'User.Read',
      },
    ],

    inputSchema: z.object({
      tenantId: z.string().optional().describe('Azure AD tenant ID. Defaults to "common" for multi-tenant apps.'),
    }),

    getAuthorizationUrl: async (ctx) => {
      let tenant = ctx.input.tenantId || 'common';
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        response_mode: 'query',
      });

      return {
        url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`,
        input: ctx.input,
      };
    },

    handleCallback: async (ctx) => {
      let tenant = ctx.input.tenantId || 'common';
      let http = createAxios();

      let response = await http.post(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: ctx.scopes.join(' '),
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
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
          expiresAt,
        },
        input: ctx.input,
      };
    },

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available. Re-authenticate with the offline_access scope.');
      }

      let tenant = ctx.input.tenantId || 'common';
      let http = createAxios();

      let response = await http.post(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: ctx.scopes.join(' '),
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
        },
        input: ctx.input,
      };
    },

    getProfile: async (ctx: any) => {
      let http = createAxios({
        baseURL: 'https://graph.microsoft.com/v1.0',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });

      let response = await http.get('/me');
      let user = response.data;

      return {
        profile: {
          id: user.id,
          email: user.mail || user.userPrincipalName,
          name: user.displayName,
        },
      };
    },
  });
