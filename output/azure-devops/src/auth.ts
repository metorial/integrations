import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string().describe('Access token or PAT for Azure DevOps API'),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Microsoft Entra ID OAuth',
    key: 'entra_oauth',

    scopes: [
      { title: 'Profile', description: 'Read user profile', scope: 'vso.profile' },
      { title: 'Identity', description: 'Read identities and groups', scope: 'vso.identity' },
      { title: 'Project Read', description: 'Read projects and teams', scope: 'vso.project' },
      { title: 'Project Manage', description: 'Create and manage projects', scope: 'vso.project_manage' },
      { title: 'Work Items Read', description: 'Read work items, boards, and queries', scope: 'vso.work' },
      { title: 'Work Items Write', description: 'Create and update work items', scope: 'vso.work_write' },
      { title: 'Work Items Full', description: 'Full access to work items including delete', scope: 'vso.work_full' },
      { title: 'Code Read', description: 'Read repositories and code', scope: 'vso.code' },
      { title: 'Code Write', description: 'Read and write repositories', scope: 'vso.code_write' },
      { title: 'Code Manage', description: 'Full access to code repositories', scope: 'vso.code_manage' },
      { title: 'Build Read', description: 'Read build pipelines and results', scope: 'vso.build' },
      { title: 'Build Execute', description: 'Read and execute build pipelines', scope: 'vso.build_execute' },
      { title: 'Release Manage', description: 'Manage release pipelines', scope: 'vso.release_manage' },
      { title: 'Service Hooks Write', description: 'Create and manage service hook subscriptions', scope: 'vso.hooks_write' },
    ],

    inputSchema: z.object({
      tenantId: z.string().describe('Microsoft Entra (Azure AD) tenant ID'),
    }),

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        scope: [...ctx.scopes.map(s => `499b84ac-1321-427f-aa17-267ca6975798/${s}`), 'offline_access'].join(' '),
      });

      let url = `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;

      return { url, input: ctx.input };
    },

    handleCallback: async (ctx) => {
      let axios = createAxios();

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code',
          scope: [...ctx.scopes.map(s => `499b84ac-1321-427f-aa17-267ca6975798/${s}`), 'offline_access'].join(' '),
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
        },
        input: ctx.input,
      };
    },

    handleTokenRefresh: async (ctx) => {
      let axios = createAxios();

      let response = await axios.post(
        `https://login.microsoftonline.com/${ctx.input.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.token,
          grant_type: 'refresh_token',
          scope: '499b84ac-1321-427f-aa17-267ca6975798/.default offline_access',
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
        },
        input: ctx.input,
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { tenantId: string }; scopes: string[] }) => {
      let axios = createAxios({
        baseURL: 'https://app.vssps.visualstudio.com',
      });

      let response = await axios.get('/_apis/profile/profiles/me?api-version=7.1', {
        headers: { Authorization: `Bearer ${ctx.output.token}` },
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
          imageUrl: data.coreAttributes?.Avatar?.value?.value,
        },
      };
    },
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'pat',

    inputSchema: z.object({
      personalAccessToken: z.string().describe('Azure DevOps Personal Access Token (PAT)'),
    }),

    getOutput: async (ctx) => {
      let encoded = btoa(`:${ctx.input.personalAccessToken}`);
      return {
        output: {
          token: `Basic ${encoded}`,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { personalAccessToken: string } }) => {
      let axios = createAxios({
        baseURL: 'https://app.vssps.visualstudio.com',
      });

      let authHeader = ctx.output.token.startsWith('Basic ')
        ? ctx.output.token
        : `Bearer ${ctx.output.token}`;

      let response = await axios.get('/_apis/profile/profiles/me?api-version=7.1', {
        headers: { Authorization: authHeader },
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
          email: data.emailAddress,
        },
      };
    },
  });
