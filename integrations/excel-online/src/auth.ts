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
        title: 'Read Files',
        description: "Read-only access to the user's files and Excel workbooks",
        scope: 'Files.Read'
      },
      {
        title: 'Read/Write Files',
        description: "Read and write access to the user's files and Excel workbooks",
        scope: 'Files.ReadWrite'
      },
      {
        title: 'Read All Files',
        description: 'Read all files the user can access',
        scope: 'Files.Read.All'
      },
      {
        title: 'Read/Write All Files',
        description: 'Read and write all files the user can access',
        scope: 'Files.ReadWrite.All'
      },
      {
        title: 'Read All Sites',
        description: 'Read SharePoint sites the user can access',
        scope: 'Sites.Read.All'
      },
      {
        title: 'Read/Write All Sites',
        description: 'Read and write SharePoint sites the user can access',
        scope: 'Sites.ReadWrite.All'
      },
      {
        title: 'User Profile',
        description: "Read the user's basic profile information",
        scope: 'User.Read'
      },
      {
        title: 'Offline Access',
        description:
          'Maintain access to data you have given it access to (required for refresh tokens)',
        scope: 'offline_access'
      }
    ],

    inputSchema: z.object({
      tenantId: z
        .string()
        .optional()
        .describe(
          'Microsoft Entra tenant ID. Use "common" for multi-tenant, "organizations" for work/school accounts, or a specific tenant ID.'
        )
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
          expiresAt
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error(
          'No refresh token available. Ensure "offline_access" scope is included.'
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
          expiresAt
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string };
      input: { tenantId?: string };
      scopes: string[];
    }) => {
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
