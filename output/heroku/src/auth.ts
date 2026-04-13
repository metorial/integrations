import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let herokuApi = createAxios({
  baseURL: 'https://api.heroku.com'
});

let herokuIdentity = createAxios({
  baseURL: 'https://id.heroku.com'
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional()
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Global',
        description: 'Global access encompassing all other scopes.',
        scope: 'global'
      },
      {
        title: 'Identity',
        description: 'Access to GET /account for basic user info only.',
        scope: 'identity'
      },
      {
        title: 'Read',
        description: 'Read access to all apps and their subresources, except protected subresources like config vars and releases.',
        scope: 'read'
      },
      {
        title: 'Write',
        description: 'Write access to apps and unprotected subresources. Superset of read.',
        scope: 'write'
      },
      {
        title: 'Read Protected',
        description: 'Read including protected subresources like config vars. Superset of read.',
        scope: 'read-protected'
      },
      {
        title: 'Write Protected',
        description: 'Write including protected subresources. Superset of read-protected and write.',
        scope: 'write-protected'
      }
    ],

    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state
      });

      return {
        url: `https://id.heroku.com/oauth/authorize?${params.toString()}`
      };
    },

    handleCallback: async (ctx) => {
      let response = await herokuIdentity.post('/oauth/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      let data = response.data;

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

    handleTokenRefresh: async (ctx) => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let response = await herokuIdentity.post('/oauth/token', new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt: data.expires_in
            ? new Date(Date.now() + data.expires_in * 1000).toISOString()
            : undefined
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await herokuApi.get('/account', {
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        }
      });

      let account = response.data;

      return {
        profile: {
          id: account.id,
          email: account.email,
          name: account.name || account.email
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Token',
    key: 'api_token',

    inputSchema: z.object({
      token: z.string().describe('Heroku API token or authorization key')
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: any) => {
      let response = await herokuApi.get('/account', {
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        }
      });

      let account = response.data;

      return {
        profile: {
          id: account.id,
          email: account.email,
          name: account.name || account.email
        }
      };
    }
  });
