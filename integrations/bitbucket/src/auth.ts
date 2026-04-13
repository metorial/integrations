import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let api = createAxios({
  baseURL: 'https://api.bitbucket.org/2.0'
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
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Account Read',
        description: 'Read user account information',
        scope: 'account'
      },
      {
        title: 'Account Write',
        description: 'Write user account information',
        scope: 'account:write'
      },
      { title: 'Email', description: 'Read user primary email address', scope: 'email' },
      {
        title: 'Repository Read',
        description: 'Read access to repositories',
        scope: 'repository'
      },
      {
        title: 'Repository Write',
        description: 'Write access to repositories',
        scope: 'repository:write'
      },
      {
        title: 'Repository Admin',
        description: 'Admin access to repositories',
        scope: 'repository:admin'
      },
      {
        title: 'Pull Request Read',
        description: 'Read access to pull requests',
        scope: 'pullrequest'
      },
      {
        title: 'Pull Request Write',
        description: 'Write access to pull requests',
        scope: 'pullrequest:write'
      },
      { title: 'Issue Read', description: 'Read access to issues', scope: 'issue' },
      { title: 'Issue Write', description: 'Write access to issues', scope: 'issue:write' },
      { title: 'Webhook', description: 'Manage webhooks', scope: 'webhook' },
      { title: 'Pipeline Read', description: 'Read access to pipelines', scope: 'pipeline' },
      {
        title: 'Pipeline Write',
        description: 'Write access to pipelines',
        scope: 'pipeline:write'
      },
      {
        title: 'Pipeline Variable',
        description: 'Manage pipeline variables',
        scope: 'pipeline:variable'
      },
      {
        title: 'Runner Read',
        description: 'Read access to pipeline runners',
        scope: 'runner'
      },
      {
        title: 'Runner Write',
        description: 'Write access to pipeline runners',
        scope: 'runner:write'
      },
      { title: 'Snippet Read', description: 'Read access to snippets', scope: 'snippet' },
      {
        title: 'Snippet Write',
        description: 'Write access to snippets',
        scope: 'snippet:write'
      },
      { title: 'Project Read', description: 'Read access to projects', scope: 'project' },
      {
        title: 'Project Admin',
        description: 'Admin access to projects',
        scope: 'project:admin'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        state: ctx.state
      });

      if (ctx.redirectUri) {
        params.set('redirect_uri', ctx.redirectUri);
      }

      return {
        url: `https://bitbucket.org/site/oauth2/authorize?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await api.post(
        'https://bitbucket.org/site/oauth2/access_token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: ctx.code,
          redirect_uri: ctx.redirectUri
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await api.post(
        'https://bitbucket.org/site/oauth2/access_token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: ctx.output.refreshToken
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      let data = response.data;
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
      let response = await api.get('/user', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data;

      return {
        profile: {
          id: user.uuid,
          name: user.display_name,
          imageUrl: user.links?.avatar?.href
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Token',
    key: 'api_token',

    inputSchema: z.object({
      email: z.string().describe('Bitbucket account email address'),
      token: z.string().describe('Bitbucket API token or app password')
    }),

    getOutput: async ctx => {
      let credentials = btoa(`${ctx.input.email}:${ctx.input.token}`);

      return {
        output: {
          token: credentials
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await api.get('/user', {
        headers: {
          Authorization: `Basic ${ctx.output.token}`
        }
      });

      let user = response.data;

      return {
        profile: {
          id: user.uuid,
          name: user.display_name,
          email: user.username,
          imageUrl: user.links?.avatar?.href
        }
      };
    }
  });
