import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let atlassianAxios = createAxios({
  baseURL: 'https://auth.atlassian.com'
});

let apiAxios = createAxios({
  baseURL: 'https://api.atlassian.com'
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
    name: 'OAuth 2.0',
    key: 'oauth',

    scopes: [
      {
        title: 'Read Requests',
        description:
          'Read customer requests, approvals, attachments, comments, SLAs, and request types',
        scope: 'read:servicedesk-request'
      },
      {
        title: 'Write Requests',
        description: 'Create and manage customer requests',
        scope: 'write:servicedesk-request'
      },
      {
        title: 'Manage Customers',
        description: 'Manage customers and organizations',
        scope: 'manage:servicedesk-customer'
      },
      {
        title: 'Read Jira Work',
        description: 'Read issues, projects, and related data',
        scope: 'read:jira-work'
      },
      {
        title: 'Write Jira Work',
        description: 'Create and edit issues',
        scope: 'write:jira-work'
      },
      {
        title: 'Manage Projects',
        description: 'Manage project settings',
        scope: 'manage:jira-project'
      },
      {
        title: 'Manage Configuration',
        description: 'Jira administration actions',
        scope: 'manage:jira-configuration'
      },
      {
        title: 'Manage Webhooks',
        description: 'Register and manage webhooks',
        scope: 'manage:jira-webhook'
      },
      {
        title: 'Read User',
        description: 'Read user profile information',
        scope: 'read:me'
      },
      {
        title: 'Offline Access',
        description: 'Access refresh tokens for long-lived sessions',
        scope: 'offline_access'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        audience: 'api.atlassian.com',
        client_id: ctx.clientId,
        scope: ctx.scopes.join(' '),
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        response_type: 'code',
        prompt: 'consent'
      });

      return {
        url: `https://auth.atlassian.com/authorize?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let response = await atlassianAxios.post('/oauth/token', {
        grant_type: 'authorization_code',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        redirect_uri: ctx.redirectUri
      });

      let data = response.data;
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

    handleTokenRefresh: async ctx => {
      let response = await atlassianAxios.post('/oauth/token', {
        grant_type: 'refresh_token',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken
      });

      let data = response.data;
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

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string };
      input: {};
      scopes: string[];
    }) => {
      let response = await apiAxios.get('/me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let data = response.data;

      return {
        profile: {
          id: data.account_id,
          email: data.email,
          name: data.name,
          imageUrl: data.picture
        }
      };
    }
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'API Token',
    key: 'api_token',

    inputSchema: z.object({
      email: z.string().describe('Your Atlassian account email address'),
      token: z.string().describe('API token generated from Atlassian account settings'),
      siteDomain: z
        .string()
        .describe('Your Atlassian site domain (e.g., "yoursite" from yoursite.atlassian.net)')
    }),

    getOutput: async (ctx: {
      input: { email: string; token: string; siteDomain: string };
    }) => {
      let credentials = btoa(`${ctx.input.email}:${ctx.input.token}`);
      return {
        output: {
          token: credentials
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string };
      input: { email: string; token: string; siteDomain: string };
    }) => {
      let ax = createAxios({
        baseURL: `https://${ctx.input.siteDomain}.atlassian.net`
      });

      let response = await ax.get('/rest/api/3/myself', {
        headers: {
          Authorization: `Basic ${ctx.output.token}`,
          Accept: 'application/json'
        }
      });

      let data = response.data;

      return {
        profile: {
          id: data.accountId,
          email: data.emailAddress,
          name: data.displayName,
          imageUrl: data.avatarUrls?.['48x48']
        }
      };
    }
  });
