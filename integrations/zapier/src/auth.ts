import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let http = createAxios({
  baseURL: 'https://zapier.com'
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
        title: 'Zaps (Read)',
        description: 'Read access to Zaps and apps',
        scope: 'zap'
      },
      {
        title: 'Zaps (All)',
        description: 'Read access to all Zaps across the account',
        scope: 'zap:all'
      },
      {
        title: 'Zaps (Write)',
        description: 'Create and modify Zaps and workflow steps',
        scope: 'zap:write'
      },
      {
        title: 'Authentications (Read)',
        description: 'Read access to authentications',
        scope: 'authentication'
      },
      {
        title: 'Authentications (Write)',
        description: 'Create new authentications',
        scope: 'authentication:write'
      },
      {
        title: 'Zap Runs',
        description: 'Read access to Zap run history',
        scope: 'zap:runs'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        response_type: 'code',
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(' '),
        response_mode: 'query',
        state: ctx.state
      });

      return {
        url: `https://api.zapier.com/v2/authorize?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await http.post(
        '/oauth/token/',
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
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await http.post(
        '/oauth/token/',
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
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token ?? ctx.output.refreshToken,
          expiresAt
        }
      };
    }
  });
