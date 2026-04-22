import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let scopes = [
  {
    title: 'Read Files',
    description: "Read the signed-in user's files",
    scope: 'Files.Read'
  },
  {
    title: 'Read All Files',
    description: 'Read all files the signed-in user can access',
    scope: 'Files.Read.All'
  },
  {
    title: 'Read/Write Files',
    description: "Read, create, update, and delete the signed-in user's files",
    scope: 'Files.ReadWrite'
  },
  {
    title: 'Read/Write All Files',
    description: 'Read, create, update, and delete all files the signed-in user can access',
    scope: 'Files.ReadWrite.All'
  },
  {
    title: 'App Folder',
    description: "Write files into the app's folder in OneDrive (personal accounts only)",
    scope: 'Files.ReadWrite.AppFolder'
  },
  {
    title: 'Read Sites',
    description: 'Read items in all site collections',
    scope: 'Sites.Read.All'
  },
  {
    title: 'Read/Write Sites',
    description: 'Read and write items in all site collections',
    scope: 'Sites.ReadWrite.All'
  },
  {
    title: 'Offline Access',
    description: 'Maintain access to data you have given it access to via a refresh token',
    scope: 'offline_access'
  },
  {
    title: 'User Profile',
    description: 'Sign in and read user profile',
    scope: 'User.Read'
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
        scope: ctx.scopes.join(' ')
      });

      return {
        url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx: any) => {
      let tokenAxios = createAxios();

      let response = await tokenAxios.post(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
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
          'No refresh token available. Re-authorize with the offline_access scope.'
        );
      }

      let tokenAxios = createAxios();

      let response = await tokenAxios.post(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
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
        baseURL: 'https://graph.microsoft.com/v1.0',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let response = await graphAxios.get('/me');
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
