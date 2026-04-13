import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      tenantId: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth2',

    scopes: [
      {
        title: 'Read Mail',
        description: 'Read email messages in user mailboxes',
        scope: 'Mail.Read'
      },
      {
        title: 'Read/Write Mail',
        description: 'Read and write email messages in user mailboxes',
        scope: 'Mail.ReadWrite'
      },
      {
        title: 'Send Mail',
        description: 'Send email messages on behalf of the user',
        scope: 'Mail.Send'
      },
      {
        title: 'Read User Profile',
        description: 'Read basic user profile information',
        scope: 'User.Read'
      },
      {
        title: 'Offline Access',
        description: 'Maintain access with a refresh token',
        scope: 'offline_access'
      },
      { title: 'OpenID', description: 'Sign in and read user profile', scope: 'openid' },
      { title: 'Profile', description: 'Read user basic profile', scope: 'profile' },
      { title: 'Email', description: 'Read user email address', scope: 'email' }
    ],

    inputSchema: z.object({
      tenantId: z
        .string()
        .optional()
        .describe('Microsoft Entra tenant ID. Defaults to "common" if not provided.')
    }),

    getAuthorizationUrl: async ctx => {
      let tenant = ctx.input.tenantId || 'common';
      let scopes = ctx.scopes.join(' ');

      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: scopes,
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

      let tokenAxios = createAxios({
        baseURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`
      });

      let response = await tokenAxios.post(
        '/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: ctx.scopes.join(' ')
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
          expiresAt,
          tenantId: ctx.input.tenantId
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error(
          'No refresh token available. Ensure offline_access scope is requested.'
        );
      }

      let tenant = ctx.input.tenantId || 'common';

      let tokenAxios = createAxios({
        baseURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`
      });

      let response = await tokenAxios.post(
        '/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: ctx.scopes.join(' ')
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
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
          tenantId: ctx.input.tenantId
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string; tenantId?: string };
      input: { tenantId?: string };
      scopes: string[];
    }) => {
      let graphAxios = createAxios({
        baseURL: 'https://graph.microsoft.com/v1.0'
      });

      let response = await graphAxios.get('/me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
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
