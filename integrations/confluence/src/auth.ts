import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let ax = createAxios();

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      cloudId: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth 2.0 (Confluence Cloud)',
    key: 'oauth',

    scopes: [
      {
        title: 'Read Content',
        description: 'Read all Confluence content including page and blog post bodies',
        scope: 'read:confluence-content.all'
      },
      {
        title: 'Read Content Summary',
        description: 'Read Confluence content summaries',
        scope: 'read:confluence-content.summary'
      },
      {
        title: 'Write Content',
        description: 'Create and update pages, blog posts, and comments',
        scope: 'write:confluence-content'
      },
      {
        title: 'Write Space',
        description: 'Create and manage Confluence spaces',
        scope: 'write:confluence-space'
      },
      {
        title: 'Read Space Summary',
        description: 'Read Confluence space summaries',
        scope: 'read:confluence-space.summary'
      },
      {
        title: 'Write File',
        description: 'Upload and manage file attachments',
        scope: 'write:confluence-file'
      },
      {
        title: 'Read Properties',
        description: 'Read content properties',
        scope: 'read:confluence-props'
      },
      {
        title: 'Write Properties',
        description: 'Create and update content properties',
        scope: 'write:confluence-props'
      },
      {
        title: 'Search',
        description: 'Search Confluence content using CQL',
        scope: 'search:confluence'
      },
      {
        title: 'Read User',
        description: 'Read user profile information',
        scope: 'read:confluence-user'
      },
      {
        title: 'Read Groups',
        description: 'Read group information and membership',
        scope: 'read:confluence-groups'
      },
      {
        title: 'Write Groups',
        description: 'Create and manage groups',
        scope: 'write:confluence-groups'
      },
      {
        title: 'Manage Configuration',
        description: 'Manage global Confluence configuration settings',
        scope: 'manage:confluence-configuration'
      },
      {
        title: 'Read Attachments',
        description: 'Download file attachments',
        scope: 'readonly:content.attachment:confluence'
      },
      {
        title: 'Offline Access',
        description: 'Enable refresh tokens for long-lived access',
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
      let tokenResponse = await ax.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        redirect_uri: ctx.redirectUri
      });

      let accessToken = tokenResponse.data.access_token as string;
      let refreshToken = tokenResponse.data.refresh_token as string | undefined;
      let expiresIn = tokenResponse.data.expires_in as number | undefined;

      let expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined;

      // Fetch the cloud ID from accessible resources
      let resourcesResponse = await ax.get(
        'https://api.atlassian.com/oauth/token/accessible-resources',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      let resources = resourcesResponse.data as Array<{
        id: string;
        name: string;
        url: string;
      }>;
      let cloudId = resources.length > 0 ? resources[0]!.id : undefined;

      return {
        output: {
          token: accessToken,
          refreshToken,
          expiresAt,
          cloudId
        }
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error(
          'No refresh token available. Ensure the offline_access scope is included.'
        );
      }

      let tokenResponse = await ax.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken
      });

      let accessToken = tokenResponse.data.access_token as string;
      let refreshToken =
        (tokenResponse.data.refresh_token as string | undefined) || ctx.output.refreshToken;
      let expiresIn = tokenResponse.data.expires_in as number | undefined;

      let expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: accessToken,
          refreshToken,
          expiresAt,
          cloudId: ctx.output.cloudId
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string; cloudId?: string };
      input: {};
      scopes: string[];
    }) => {
      let response = await ax.get('https://api.atlassian.com/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data as {
        account_id: string;
        email: string;
        name: string;
        picture: string;
      };

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
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Token (Confluence Cloud)',
    key: 'api_token',

    inputSchema: z.object({
      email: z.string().describe('Atlassian account email address'),
      token: z
        .string()
        .describe(
          'API token generated from https://id.atlassian.com/manage-profile/security/api-tokens'
        ),
      domain: z
        .string()
        .describe('Atlassian domain (e.g., "mycompany" for mycompany.atlassian.net)')
    }),

    getOutput: async (ctx: { input: { email: string; token: string; domain: string } }) => {
      let credentials = btoa(`${ctx.input.email}:${ctx.input.token}`);
      return {
        output: {
          token: credentials
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string };
      input: { email: string; token: string; domain: string };
    }) => {
      let response = await ax.get(
        `https://${ctx.input.domain}.atlassian.net/wiki/rest/api/user/current`,
        {
          headers: { Authorization: `Basic ${ctx.output.token}` }
        }
      );

      let data = response.data as {
        accountId: string;
        email: string;
        displayName: string;
        profilePicture?: { path: string };
      };

      return {
        profile: {
          id: data.accountId,
          email: data.email,
          name: data.displayName,
          imageUrl: data.profilePicture?.path
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token (Data Center)',
    key: 'pat',

    inputSchema: z.object({
      token: z.string().describe('Personal access token for Confluence Data Center'),
      baseUrl: z
        .string()
        .describe(
          'Base URL of your Confluence Data Center instance (e.g., https://confluence.example.com)'
        )
    }),

    getOutput: async (ctx: { input: { token: string; baseUrl: string } }) => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string };
      input: { token: string; baseUrl: string };
    }) => {
      let response = await ax.get(`${ctx.input.baseUrl}/rest/api/user/current`, {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data as { username: string; displayName: string; userKey: string };

      return {
        profile: {
          id: data.userKey,
          name: data.displayName
        }
      };
    }
  });
