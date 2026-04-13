import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      host: z.string().optional(),
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
        title: 'Full API Access',
        description: 'Complete read/write access to the API',
        scope: 'api'
      },
      {
        title: 'Read API',
        description: 'Read-only access to the API',
        scope: 'read_api'
      },
      {
        title: 'Read User',
        description: 'Read the authenticated user profile',
        scope: 'read_user'
      },
      {
        title: 'Read Repository',
        description: 'Read-only access to repositories',
        scope: 'read_repository'
      },
      {
        title: 'Write Repository',
        description: 'Read/write access to repositories',
        scope: 'write_repository'
      },
      {
        title: 'Read Registry',
        description: 'Read-only access to container registry',
        scope: 'read_registry'
      },
      {
        title: 'Write Registry',
        description: 'Read/write access to container registry',
        scope: 'write_registry'
      },
      {
        title: 'Create Runner',
        description: 'Create new CI/CD runners',
        scope: 'create_runner'
      },
      {
        title: 'Manage Runner',
        description: 'Manage existing CI/CD runners',
        scope: 'manage_runner'
      }
    ],

    inputSchema: z.object({
      host: z.string().default('https://gitlab.com').describe('GitLab host URL')
    }),

    getAuthorizationUrl: async ctx => {
      let host = ctx.input.host || 'https://gitlab.com';
      let scopeStr = ctx.scopes.join(' ');
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state,
        scope: scopeStr
      });
      return {
        url: `${host}/oauth/authorize?${params.toString()}`,
        input: { host }
      };
    },

    handleCallback: async ctx => {
      let host = ctx.input.host || 'https://gitlab.com';
      let http = createAxios({ baseURL: host });

      let response = await http.post('/oauth/token', {
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        code: ctx.code,
        grant_type: 'authorization_code',
        redirect_uri: ctx.redirectUri
      });

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type: string;
      };

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          host
        },
        input: { host }
      };
    },

    handleTokenRefresh: async ctx => {
      let host = ctx.input.host || ctx.output.host || 'https://gitlab.com';
      let http = createAxios({ baseURL: host });

      let response = await http.post('/oauth/token', {
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        refresh_token: ctx.output.refreshToken,
        grant_type: 'refresh_token'
      });

      let data = response.data as {
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        token_type: string;
      };

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt,
          host
        },
        input: { host }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; host?: string; refreshToken?: string; expiresAt?: string };
      input: { host: string };
      scopes: string[];
    }) => {
      let host = ctx.output.host || 'https://gitlab.com';
      let http = createAxios({ baseURL: `${host}/api/v4` });

      let response = await http.get('/user', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data as {
        id: number;
        username: string;
        email: string;
        name: string;
        avatar_url: string;
      };

      return {
        profile: {
          id: String(user.id),
          email: user.email,
          name: user.name,
          imageUrl: user.avatar_url
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'pat',

    inputSchema: z.object({
      token: z.string().describe('GitLab Personal Access Token'),
      host: z.string().default('https://gitlab.com').describe('GitLab host URL')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token,
          host: ctx.input.host
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; host?: string; refreshToken?: string; expiresAt?: string };
      input: { token: string; host: string };
    }) => {
      let host = ctx.output.host || 'https://gitlab.com';
      let http = createAxios({ baseURL: `${host}/api/v4` });

      let response = await http.get('/user', {
        headers: { 'PRIVATE-TOKEN': ctx.output.token }
      });

      let user = response.data as {
        id: number;
        username: string;
        email: string;
        name: string;
        avatar_url: string;
      };

      return {
        profile: {
          id: String(user.id),
          email: user.email,
          name: user.name,
          imageUrl: user.avatar_url
        }
      };
    }
  });
