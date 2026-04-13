import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let outputSchema = z.object({
  token: z.string(),
  cloudId: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().optional()
});

type AuthOutput = z.infer<typeof outputSchema>;

export let auth = SlateAuth.create()
  .output(outputSchema)
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0',
    key: 'oauth2',

    scopes: [
      {
        title: 'Read Jira Work',
        description: 'Read access to Jira projects, issues, worklogs, etc.',
        scope: 'read:jira-work'
      },
      {
        title: 'Write Jira Work',
        description: 'Write access to create/update issues, worklogs, etc.',
        scope: 'write:jira-work'
      },
      {
        title: 'Read Jira User',
        description: 'Read access to user information.',
        scope: 'read:jira-user'
      },
      {
        title: 'Manage Jira Project',
        description: 'Manage project settings.',
        scope: 'manage:jira-project'
      },
      {
        title: 'Manage Jira Configuration',
        description: 'Manage Jira global settings.',
        scope: 'manage:jira-configuration'
      },
      {
        title: 'Manage Jira Webhook',
        description: 'Manage webhooks for receiving event notifications.',
        scope: 'manage:jira-webhook'
      },
      {
        title: 'Offline Access',
        description: 'Enables refresh tokens for long-lived access.',
        scope: 'offline_access'
      },
      {
        title: 'Read Me',
        description: 'Read profile information for the authenticated user.',
        scope: 'read:me'
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
      let http = createAxios();

      let tokenResponse = await http.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        redirect_uri: ctx.redirectUri
      });

      let accessToken = tokenResponse.data.access_token;
      let refreshToken = tokenResponse.data.refresh_token;
      let expiresIn = tokenResponse.data.expires_in;
      let expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined;

      let resourcesResponse = await http.get(
        'https://api.atlassian.com/oauth/token/accessible-resources',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      let resources = resourcesResponse.data as Array<{
        id: string;
        name: string;
        url: string;
      }>;
      let cloudId = resources[0]?.id ?? '';

      return {
        output: {
          token: accessToken,
          cloudId,
          refreshToken,
          expiresAt
        }
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let http = createAxios();

      let tokenResponse = await http.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken
      });

      let accessToken = tokenResponse.data.access_token;
      let refreshToken = tokenResponse.data.refresh_token ?? ctx.output.refreshToken;
      let expiresIn = tokenResponse.data.expires_in;
      let expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: accessToken,
          cloudId: ctx.output.cloudId,
          refreshToken,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: { output: AuthOutput; input: {}; scopes: string[] }) => {
      let http = createAxios({
        baseURL: 'https://api.atlassian.com',
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let meResponse = await http.get('/me');
      let me = meResponse.data;

      return {
        profile: {
          id: me.account_id,
          email: me.email,
          name: me.name,
          imageUrl: me.picture
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Token',
    key: 'api_token',

    inputSchema: z.object({
      email: z.string().describe('The email address associated with your Atlassian account.'),
      token: z
        .string()
        .describe(
          'API token generated from https://id.atlassian.com/manage-profile/security/api-tokens'
        ),
      cloudId: z
        .string()
        .describe(
          'Your Jira Cloud ID. Found at https://your-domain.atlassian.net/_edge/tenant_info'
        )
    }),

    getOutput: async ctx => {
      let basicToken = btoa(`${ctx.input.email}:${ctx.input.token}`);

      return {
        output: {
          token: basicToken,
          cloudId: ctx.input.cloudId
        }
      };
    },

    getProfile: async (ctx: {
      output: AuthOutput;
      input: { email: string; token: string; cloudId: string };
    }) => {
      let http = createAxios({
        baseURL: `https://api.atlassian.com/ex/jira/${ctx.output.cloudId}/rest/api/3`,
        headers: { Authorization: `Basic ${ctx.output.token}` }
      });

      let response = await http.get('/myself');
      let user = response.data;

      return {
        profile: {
          id: user.accountId,
          email: user.emailAddress,
          name: user.displayName,
          imageUrl: user.avatarUrls?.['48x48']
        }
      };
    }
  });
