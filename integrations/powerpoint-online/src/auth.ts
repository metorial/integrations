import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let graphAxios = createAxios({
  baseURL: 'https://graph.microsoft.com/v1.0'
});

let scopes = [
  {
    title: 'Read Files',
    description: "Read the signed-in user's files",
    scope: 'Files.Read'
  },
  {
    title: 'Read All Files',
    description: 'Read all files the user can access',
    scope: 'Files.Read.All'
  },
  {
    title: 'Read & Write Files',
    description: "Read and write the signed-in user's files",
    scope: 'Files.ReadWrite'
  },
  {
    title: 'Read & Write All Files',
    description: 'Read and write all files the user can access',
    scope: 'Files.ReadWrite.All'
  },
  {
    title: 'Read SharePoint Sites',
    description: 'Read items in all site collections',
    scope: 'Sites.Read.All'
  },
  {
    title: 'Read & Write SharePoint Sites',
    description: 'Read and write items in all site collections',
    scope: 'Sites.ReadWrite.All'
  },
  {
    title: 'Read User Profile',
    description: "Read the signed-in user's profile",
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
        state: ctx.state,
        scope: ctx.scopes.join(' '),
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
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data as any;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

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
        throw new Error('No refresh token available. Please re-authenticate.');
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
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data as any;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await graphAxios.get('/me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data as any;

      return {
        profile: {
          id: user.id,
          email: user.mail || user.userPrincipalName,
          name: user.displayName
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
