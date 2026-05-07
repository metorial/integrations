import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';
import { bitbucketApiError, bitbucketServiceError } from './lib/errors';

let api = createAxios({
  baseURL: 'https://api.bitbucket.org/2.0'
});

api.interceptors?.response.use(
  response => response,
  error => Promise.reject(bitbucketApiError(error))
);

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
        title: 'Repository Delete',
        description: 'Delete repositories',
        scope: 'repository:delete'
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

      let scopes = ctx.scopes as string[] | undefined;
      if (scopes?.length) {
        params.set('scope', scopes.join(' '));
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
        throw bitbucketServiceError('No refresh token available');
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
      email: z
        .string()
        .describe(
          'Basic-auth username: your **Atlassian account email** (Bitbucket → Personal settings → Email aliases) when using an **API token**; your **Bitbucket username** (same settings page) when using an **app password** (deprecated until June 2026).'
        ),
      token: z
        .string()
        .describe(
          'Basic-auth password: a **Bitbucket** API token from id.atlassian.com → Security → Create API token **with scopes** → app **Bitbucket** (e.g. grant **Repositories: Write** to create repos), or an app password with matching Bitbucket scopes.'
        )
    }),

    getOutput: async ctx => {
      let credentials = btoa(`${ctx.input.email}:${ctx.input.token}`);

      return {
        output: {
          // Full Authorization header value; Client passes this through (OAuth uses raw bearer token).
          token: `Basic ${credentials}`
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await api.get('/user', {
        headers: {
          Authorization: ctx.output.token
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
