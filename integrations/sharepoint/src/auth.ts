import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let scopes = [
  {
    title: 'Sites Read',
    description: 'Read items in all site collections',
    scope: 'Sites.Read.All'
  },
  {
    title: 'Sites Read Write',
    description: 'Read and write items in all site collections',
    scope: 'Sites.ReadWrite.All'
  },
  {
    title: 'Sites Manage',
    description: 'Create, edit, and delete items and lists in all site collections',
    scope: 'Sites.Manage.All'
  },
  {
    title: 'Sites Full Control',
    description: 'Full control of all site collections',
    scope: 'Sites.FullControl.All'
  },
  {
    title: 'Files Read',
    description: 'Read all files that user can access',
    scope: 'Files.Read.All'
  },
  {
    title: 'Files Read Write',
    description: 'Read and write all files that user can access',
    scope: 'Files.ReadWrite.All'
  },
  {
    title: 'User Read',
    description: 'Read user profile',
    scope: 'User.Read'
  },
  {
    title: 'Offline Access',
    description:
      'Maintain access to data you have given it access to (enables refresh tokens)',
    scope: 'offline_access'
  }
];

function createMicrosoftOauth(name: string, key: string, tenant: string) {
  return {
    type: 'auth.oauth' as const,
    name,
    key,
    scopes,

    getAuthorizationUrl: async (ctx: any) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        response_mode: 'query'
      });

      return {
        url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: any) => {
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
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      let data = response.data as any;

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

    handleTokenRefresh: async (ctx: any) => {
      if (!ctx.output.refreshToken) {
        throw new Error(
          'No refresh token available. Ensure "offline_access" scope is included.'
        );
      }

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
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );

      let data = response.data as any;

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: any) => {
      let graphAxios = createAxios({
        baseURL: 'https://graph.microsoft.com/v1.0'
      });

      let response = await graphAxios.get('/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data as any;

      return {
        profile: {
          id: data.id,
          email: data.mail || data.userPrincipalName,
          name: data.displayName
        }
      };
    }
  };
}

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional()
    })
  )
  .addOauth(createMicrosoftOauth('Work & Personal', 'oauth_common', 'common'))
  .addOauth(createMicrosoftOauth('Work Only', 'oauth_organizations', 'organizations'));
