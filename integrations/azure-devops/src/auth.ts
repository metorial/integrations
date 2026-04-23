import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let scopes = [
  { title: 'Profile', description: 'Read user profile', scope: 'vso.profile' },
  {
    title: 'Identity',
    description: 'Read identities and groups',
    scope: 'vso.identity',
    defaultChecked: false
  },
  { title: 'Project Read', description: 'Read projects and teams', scope: 'vso.project' },
  {
    title: 'Project Manage',
    description: 'Create and manage projects',
    scope: 'vso.project_manage',
    defaultChecked: false
  },
  {
    title: 'Work Items Read',
    description: 'Read work items, boards, and queries',
    scope: 'vso.work',
    defaultChecked: false
  },
  {
    title: 'Work Items Write',
    description: 'Create and update work items',
    scope: 'vso.work_write',
    defaultChecked: false
  },
  {
    title: 'Work Items Full',
    description: 'Full access to work items including delete',
    scope: 'vso.work_full'
  },
  {
    title: 'Code Read',
    description: 'Read repositories and code',
    scope: 'vso.code',
    defaultChecked: false
  },
  {
    title: 'Code Write',
    description: 'Read and write repositories',
    scope: 'vso.code_write',
    defaultChecked: false
  },
  {
    title: 'Code Manage',
    description: 'Full access to code repositories',
    scope: 'vso.code_manage'
  },
  {
    title: 'Build Read',
    description: 'Read build pipelines and results',
    scope: 'vso.build',
    defaultChecked: false
  },
  {
    title: 'Build Execute',
    description: 'Read and execute build pipelines',
    scope: 'vso.build_execute'
  },
  {
    title: 'Wiki Read',
    description: 'Read Azure DevOps wikis and pages',
    scope: 'vso.wiki',
    defaultChecked: false
  },
  {
    title: 'Wiki Write',
    description: 'Create and update Azure DevOps wikis and pages',
    scope: 'vso.wiki_write'
  },
  {
    title: 'Release Manage',
    description: 'Manage release pipelines',
    scope: 'vso.release_manage',
    defaultChecked: false
  },
  {
    title: 'Service Hooks Write',
    description: 'Create and manage service hook subscriptions',
    scope: 'vso.hooks_write',
    defaultChecked: false
  }
];

const AZURE_DEVOPS_RESOURCE = '499b84ac-1321-427f-aa17-267ca6975798';

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
        response_mode: 'query',
        scope: [
          ...ctx.scopes.map((s: string) => `${AZURE_DEVOPS_RESOURCE}/${s}`),
          'offline_access'
        ].join(' ')
      });

      let url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;

      return { url };
    },

    handleCallback: async (ctx: any) => {
      let axios = createAxios();

      let response = await axios.post(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: [
            ...ctx.scopes.map((s: string) => `${AZURE_DEVOPS_RESOURCE}/${s}`),
            'offline_access'
          ].join(' ')
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

      let axios = createAxios();

      let response = await axios.post(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          scope: [
            ...ctx.scopes.map((s: string) => `${AZURE_DEVOPS_RESOURCE}/${s}`),
            'offline_access'
          ].join(' ')
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
      let axios = createAxios({
        baseURL: 'https://app.vssps.visualstudio.com'
      });

      let response = await axios.get('/_apis/profile/profiles/me?api-version=7.1', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data as {
        id?: string;
        displayName?: string;
        emailAddress?: string;
        coreAttributes?: {
          Avatar?: { value?: { value?: string } };
        };
      };

      return {
        profile: {
          id: data.id,
          name: data.displayName,
          email: data.emailAddress,
          imageUrl: data.coreAttributes?.Avatar?.value?.value
        }
      };
    }
  };
}

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string().describe('Access token or PAT for Azure DevOps API'),
      refreshToken: z.string().optional().describe('OAuth refresh token'),
      expiresAt: z.string().optional().describe('Token expiration timestamp (ISO 8601)')
    })
  )
  .addOauth(createMicrosoftOauth('Work & Personal', 'oauth_common', 'common'))
  .addOauth(createMicrosoftOauth('Work Only', 'oauth_organizations', 'organizations'))
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'pat',

    inputSchema: z.object({
      personalAccessToken: z.string().describe('Azure DevOps Personal Access Token (PAT)')
    }),

    getOutput: async ctx => {
      let encoded = btoa(`:${ctx.input.personalAccessToken}`);
      return {
        output: {
          token: `Basic ${encoded}`
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string };
      input: { personalAccessToken: string };
    }) => {
      let axios = createAxios({
        baseURL: 'https://app.vssps.visualstudio.com'
      });

      let authHeader = ctx.output.token.startsWith('Basic ')
        ? ctx.output.token
        : `Bearer ${ctx.output.token}`;

      let response = await axios.get('/_apis/profile/profiles/me?api-version=7.1', {
        headers: { Authorization: authHeader }
      });

      let data = response.data as {
        id?: string;
        displayName?: string;
        emailAddress?: string;
      };

      return {
        profile: {
          id: data.id,
          name: data.displayName,
          email: data.emailAddress
        }
      };
    }
  });
