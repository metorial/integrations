import { SlateAuth, axios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      instanceUrl: z.string(),
      tenantId: z.string()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth (Delegated)',
    key: 'oauth_delegated',

    scopes: [
      {
        title: 'User Impersonation',
        description: 'Access Dynamics 365 as the signed-in user',
        scope: 'user_impersonation'
      },
      {
        title: 'Offline Access',
        description: 'Maintain access with refresh tokens',
        scope: 'offline_access'
      }
    ],

    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra ID tenant ID'),
      instanceUrl: z
        .string()
        .describe('Dynamics 365 instance URL (e.g., https://yourorg.crm.dynamics.com)')
    }),

    getAuthorizationUrl: async ctx => {
      let instanceUrl = ctx.input.instanceUrl.replace(/\/+$/, '');
      let scopes = ctx.scopes
        .filter(s => s !== 'offline_access')
        .map(s => `${instanceUrl}/${s}`);
      if (ctx.scopes.includes('offline_access')) {
        scopes.push('offline_access');
      }

      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: scopes.join(' '),
        state: ctx.state
      });

      return {
        url: `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let instanceUrl = ctx.input.instanceUrl.replace(/\/+$/, '');
      let scopes = ctx.scopes
        .filter(s => s !== 'offline_access')
        .map(s => `${instanceUrl}/${s}`);
      if (ctx.scopes.includes('offline_access')) {
        scopes.push('offline_access');
      }

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: scopes.join(' ')
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
          instanceUrl,
          tenantId: ctx.input.tenantId
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let instanceUrl = ctx.output.instanceUrl.replace(/\/+$/, '');
      let scopes = ctx.scopes
        .filter(s => s !== 'offline_access')
        .map(s => `${instanceUrl}/${s}`);
      if (ctx.scopes.includes('offline_access')) {
        scopes.push('offline_access');
      }

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.output.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: scopes.join(' ')
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
          instanceUrl: ctx.output.instanceUrl,
          tenantId: ctx.output.tenantId
        }
      };
    },

    getProfile: async (ctx: {
      output: {
        token: string;
        instanceUrl: string;
        tenantId: string;
        refreshToken?: string;
        expiresAt?: string;
      };
      input: { tenantId: string; instanceUrl: string };
      scopes: string[];
    }) => {
      let instanceUrl = ctx.output.instanceUrl.replace(/\/+$/, '');
      let response = await axios.get(`${instanceUrl}/api/data/v9.2/WhoAmI`, {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let whoAmI = response.data;
      let userId = whoAmI.UserId;

      let userResponse = await axios.get(
        `${instanceUrl}/api/data/v9.2/systemusers(${userId})?$select=fullname,internalemailaddress,systemuserid`,
        { headers: { Authorization: `Bearer ${ctx.output.token}` } }
      );

      let user = userResponse.data;

      return {
        profile: {
          id: user.systemuserid,
          name: user.fullname,
          email: user.internalemailaddress
        }
      };
    }
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Client Credentials (Server-to-Server)',
    key: 'client_credentials',

    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra ID tenant ID'),
      clientId: z.string().describe('Application (client) ID from the app registration'),
      clientSecret: z.string().describe('Client secret from the app registration'),
      instanceUrl: z
        .string()
        .describe('Dynamics 365 instance URL (e.g., https://yourorg.crm.dynamics.com)')
    }),

    getOutput: async ctx => {
      let instanceUrl = ctx.input.instanceUrl.replace(/\/+$/, '');

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.input.clientId,
          client_secret: ctx.input.clientSecret,
          scope: `${instanceUrl}/.default`,
          grant_type: 'client_credentials'
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: undefined,
          expiresAt,
          instanceUrl,
          tenantId: ctx.input.tenantId
        }
      };
    },

    getProfile: async (ctx: {
      output: {
        token: string;
        instanceUrl: string;
        tenantId: string;
        refreshToken?: string;
        expiresAt?: string;
      };
      input: { tenantId: string; clientId: string; clientSecret: string; instanceUrl: string };
    }) => {
      let instanceUrl = ctx.output.instanceUrl.replace(/\/+$/, '');
      let response = await axios.get(`${instanceUrl}/api/data/v9.2/WhoAmI`, {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let whoAmI = response.data;

      return {
        profile: {
          id: whoAmI.UserId,
          name: `Application User (${whoAmI.OrganizationId})`
        }
      };
    }
  });
