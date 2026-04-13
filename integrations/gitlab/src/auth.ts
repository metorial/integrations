import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      instanceUrl: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'GitLab OAuth',
    key: 'gitlab_oauth',

    inputSchema: z.object({
      instanceUrl: z
        .string()
        .optional()
        .describe(
          'GitLab instance URL (e.g. https://gitlab.example.com). Leave empty for GitLab.com.'
        )
    }),

    scopes: [
      {
        title: 'API',
        description:
          'Complete read/write access to the API, including all groups, projects, registries, and packages',
        scope: 'api'
      },
      {
        title: 'Read API',
        description: 'Read-only access to the API',
        scope: 'read_api'
      },
      {
        title: 'Read User',
        description: "Read-only access to the authenticated user's profile",
        scope: 'read_user'
      },
      {
        title: 'Read Repository',
        description: 'Read-only access to repositories via Git-over-HTTP',
        scope: 'read_repository'
      },
      {
        title: 'Write Repository',
        description: 'Read-write access to repositories via Git-over-HTTP',
        scope: 'write_repository'
      },
      {
        title: 'Read Registry',
        description: 'Read-only access to container registry images',
        scope: 'read_registry'
      },
      {
        title: 'Write Registry',
        description: 'Write access to container registry images',
        scope: 'write_registry'
      },
      {
        title: 'Create Runner',
        description: 'Permission to create runners',
        scope: 'create_runner'
      },
      {
        title: 'Manage Runner',
        description: 'Permission to manage runners',
        scope: 'manage_runner'
      },
      {
        title: 'AI Features',
        description: 'Access to GitLab Duo AI-related endpoints',
        scope: 'ai_features'
      },
      {
        title: 'OpenID',
        description:
          'Authenticate via OpenID Connect; read-only access to profile and group memberships',
        scope: 'openid'
      },
      {
        title: 'Profile',
        description: 'Read-only access to user profile via OpenID Connect',
        scope: 'profile'
      },
      {
        title: 'Email',
        description: "Read-only access to the user's primary email via OpenID Connect",
        scope: 'email'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let baseUrl = ctx.input.instanceUrl?.replace(/\/+$/, '') || 'https://gitlab.com';

      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state
      });

      return {
        url: `${baseUrl}/oauth/authorize?${params.toString()}`,
        input: {
          instanceUrl: ctx.input.instanceUrl
        }
      };
    },

    handleCallback: async ctx => {
      let baseUrl = ctx.input.instanceUrl?.replace(/\/+$/, '') || 'https://gitlab.com';

      let oauthAxios = createAxios({
        baseURL: baseUrl
      });

      let response = await oauthAxios.post(
        '/oauth/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          grant_type: 'authorization_code',
          redirect_uri: ctx.redirectUri
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
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
          instanceUrl: ctx.input.instanceUrl
        }
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let baseUrl = ctx.input.instanceUrl?.replace(/\/+$/, '') || 'https://gitlab.com';

      let oauthAxios = createAxios({
        baseURL: baseUrl
      });

      let response = await oauthAxios.post(
        '/oauth/token',
        new URLSearchParams({
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token'
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
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
          instanceUrl: ctx.output.instanceUrl
        }
      };
    },

    getProfile: async (ctx: {
      output: {
        token: string;
        refreshToken?: string;
        expiresAt?: string;
        instanceUrl?: string;
      };
      input: { instanceUrl?: string };
      scopes: string[];
    }) => {
      let baseUrl = ctx.output.instanceUrl?.replace(/\/+$/, '') || 'https://gitlab.com';

      let apiAxios = createAxios({
        baseURL: `${baseUrl}/api/v4`
      });

      let response = await apiAxios.get('/user', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let data = response.data;

      return {
        profile: {
          id: String(data.id),
          email: data.email,
          name: data.name,
          imageUrl: data.avatar_url,
          username: data.username,
          webUrl: data.web_url
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'personal_access_token',

    inputSchema: z.object({
      token: z.string().describe('GitLab personal, project, or group access token'),
      instanceUrl: z
        .string()
        .optional()
        .describe(
          'GitLab instance URL (e.g. https://gitlab.example.com). Leave empty for GitLab.com.'
        )
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token,
          instanceUrl: ctx.input.instanceUrl
        }
      };
    },

    getProfile: async (ctx: {
      output: {
        token: string;
        refreshToken?: string;
        expiresAt?: string;
        instanceUrl?: string;
      };
      input: { token: string; instanceUrl?: string };
    }) => {
      let baseUrl = ctx.output.instanceUrl?.replace(/\/+$/, '') || 'https://gitlab.com';

      let apiAxios = createAxios({
        baseURL: `${baseUrl}/api/v4`
      });

      let response = await apiAxios.get('/user', {
        headers: {
          'PRIVATE-TOKEN': ctx.output.token
        }
      });

      let data = response.data;

      return {
        profile: {
          id: String(data.id),
          email: data.email,
          name: data.name,
          imageUrl: data.avatar_url,
          username: data.username,
          webUrl: data.web_url
        }
      };
    }
  });
