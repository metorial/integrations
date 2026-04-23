import { SlateAuth, createAxios } from 'slates';
import { toAzureDevOpsAuthHeader } from './lib/auth';
import { z } from 'zod';

let scopes = [
  {
    title: 'Code Read',
    description:
      'Read source code, metadata about commits, branches, and other version control artifacts.',
    scope: '499b84ac-1321-427f-aa17-267ca6975798/vso.code',
    defaultChecked: false
  },
  {
    title: 'Code Read & Write',
    description: 'Read, update, and delete source code; create and manage pull requests.',
    scope: '499b84ac-1321-427f-aa17-267ca6975798/vso.code_write',
    defaultChecked: false
  },
  {
    title: 'Code Manage',
    description: 'Full repository management including creating/deleting repositories.',
    scope: '499b84ac-1321-427f-aa17-267ca6975798/vso.code_manage'
  },
  {
    title: 'Code Full',
    description: 'Full access to all source code operations.',
    scope: '499b84ac-1321-427f-aa17-267ca6975798/vso.code_full'
  },
  {
    title: 'Code Status',
    description: 'Read and write commit and pull request status.',
    scope: '499b84ac-1321-427f-aa17-267ca6975798/vso.code_status',
    defaultChecked: false
  },
  {
    title: 'Profile',
    description: 'Read user profile information.',
    scope: '499b84ac-1321-427f-aa17-267ca6975798/user_impersonation'
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
      let http = createAxios({
        baseURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`
      });

      let response = await http.post(
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

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : undefined
        }
      };
    },

    handleTokenRefresh: async (ctx: any) => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let http = createAxios({
        baseURL: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`
      });

      let response = await http.post(
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

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
      };

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token ?? ctx.output.refreshToken,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : undefined
        }
      };
    },

    getProfile: async (ctx: any) => {
      let http = createAxios({
        baseURL: 'https://app.vssps.visualstudio.com/_apis',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let response = await http.get('/profile/profiles/me?api-version=7.1');
      let profile = response.data as {
        id?: string;
        displayName?: string;
        emailAddress?: string;
      };

      return {
        profile: {
          id: profile.id,
          name: profile.displayName,
          email: profile.emailAddress
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
  .addOauth(createMicrosoftOauth('Work Only', 'oauth_organizations', 'organizations'))
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'pat',

    inputSchema: z.object({
      token: z.string().describe('Azure DevOps Personal Access Token (PAT)')
    }),

    getOutput: async ctx => {
      let token = ctx.input.token.trim();
      return {
        output: {
          token: `Basic ${btoa(`:${token}`)}`
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { token: string } }) => {
      let http = createAxios({
        baseURL: 'https://app.vssps.visualstudio.com/_apis',
        headers: {
          Authorization: toAzureDevOpsAuthHeader(ctx.output.token)
        }
      });

      let response = await http.get('/profile/profiles/me?api-version=7.1');
      let profile = response.data as {
        id?: string;
        displayName?: string;
        emailAddress?: string;
      };

      return {
        profile: {
          id: profile.id,
          name: profile.displayName,
          email: profile.emailAddress
        }
      };
    }
  });
