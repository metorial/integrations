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
    name: 'Microsoft Entra ID (OAuth 2.0)',
    key: 'entra_oauth',

    scopes: [
      {
        title: 'Azure Storage Full Access',
        description: 'Full access to Azure Storage resources including blobs, containers, queues, tables, and files',
        scope: 'https://storage.azure.com/.default',
      },
      {
        title: 'User Profile',
        description: 'Read your basic profile information',
        scope: 'openid',
      },
      {
        title: 'Offline Access',
        description: 'Maintain access with a refresh token',
        scope: 'offline_access',
      },
    ],

    inputSchema: z.object({
      tenantId: z.string().describe('Azure AD Tenant ID'),
    }),

    getAuthorizationUrl: async (ctx) => {
      let tenantId = ctx.input.tenantId;
      let scopes = ctx.scopes.join(' ');
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: scopes,
        state: ctx.state,
        response_mode: 'query',
      });

      return {
        url: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`,
        input: { tenantId },
      };
    },

    handleCallback: async (ctx) => {
      let tenantId = ctx.input.tenantId;
      let http = createAxios();

      let response = await http.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
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
        input: { tenantId },
      };
    },

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let tenantId = ctx.input.tenantId;
      let http = createAxios();

      let response = await http.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
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
          refreshToken: data.refresh_token ?? ctx.output.refreshToken,
          expiresAt,
        },
        input: { tenantId },
      };
    },
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'SAS Token',
    key: 'sas_token',

    inputSchema: z.object({
      sasToken: z.string().describe('Shared Access Signature token (the query string portion starting with "sv=")'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.sasToken,
        },
      };
    },
  });
