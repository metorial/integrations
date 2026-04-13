import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      tenantId: z.string()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Microsoft Entra ID (Azure AD)',
    key: 'azure_ad_oauth',

    scopes: [
      {
        title: 'Azure Management',
        description:
          'Full access to manage Azure resources via the Azure Resource Manager API',
        scope: 'https://management.azure.com/.default'
      }
    ],

    inputSchema: z.object({
      tenantId: z.string().describe('Azure AD tenant ID for your Azure subscription')
    }),

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        scope: ctx.scopes.join(' '),
        response_mode: 'query'
      });

      return {
        url: `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let axios = createAxios();

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/token`,
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
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

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
        throw new Error('No refresh token available');
      }

      let axios = createAxios();

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.output.tenantId}/oauth2/v2.0/token`,
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
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
          tenantId: ctx.output.tenantId
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string; tenantId: string };
      input: { tenantId: string };
      scopes: string[];
    }) => {
      let axios = createAxios({
        baseURL: 'https://graph.microsoft.com/v1.0',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      try {
        let response = await axios.get('/me');
        let user = response.data;

        return {
          profile: {
            id: user.id,
            email: user.mail || user.userPrincipalName,
            name: user.displayName
          }
        };
      } catch (_e) {
        return {
          profile: {
            id: ctx.output.tenantId,
            name: `Azure Tenant ${ctx.output.tenantId}`
          }
        };
      }
    }
  });
