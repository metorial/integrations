import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';
import { getBaseUrl } from './lib/regions';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Storyblok OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Read Content',
        description: 'Read content from the space',
        scope: 'read_content'
      },
      {
        title: 'Write Content',
        description: 'Write and manage content in the space',
        scope: 'write_content'
      }
    ],

    inputSchema: z.object({
      region: z.enum(['eu', 'us', 'ca', 'ap', 'cn']).default('eu').describe('Server region')
    }),

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        scope: ctx.scopes.join(' ')
      });

      return {
        url: `https://app.storyblok.com/oauth/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let baseUrl = getBaseUrl(ctx.input.region);
      let client = createAxios({ baseURL: baseUrl });

      let response = await client.post('/oauth/token', {
        grant_type: 'authorization_code',
        code: ctx.code,
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri
      });

      let data = response.data as {
        access_token?: string;
        token_type?: string;
        error?: string;
      };

      if (!data.access_token) {
        throw new Error(`Storyblok OAuth error: ${data.error || 'No access token received'}`);
      }

      return {
        output: {
          token: data.access_token
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: {
      output: { token: string };
      input: { region: string };
      scopes: string[];
    }) => {
      let client = createAxios({
        baseURL: 'https://mapi.storyblok.com/v1',
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      try {
        let response = await client.get('/users/me');
        let data = response.data as {
          user?: {
            id?: number;
            email?: string;
            firstname?: string;
            lastname?: string;
            avatar?: string;
          };
        };

        return {
          profile: {
            id: data.user?.id?.toString(),
            email: data.user?.email,
            name:
              [data.user?.firstname, data.user?.lastname].filter(Boolean).join(' ') ||
              undefined,
            imageUrl: data.user?.avatar
          }
        };
      } catch {
        return { profile: {} };
      }
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Personal Access Token',
    key: 'personal_access_token',

    inputSchema: z.object({
      token: z
        .string()
        .describe(
          'Personal Access Token from My Account → Account Settings → Personal access tokens'
        )
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { token: string } }) => {
      let client = createAxios({
        baseURL: 'https://mapi.storyblok.com/v1',
        headers: {
          Authorization: ctx.output.token
        }
      });

      try {
        let response = await client.get('/users/me');
        let data = response.data as {
          user?: {
            id?: number;
            email?: string;
            firstname?: string;
            lastname?: string;
            avatar?: string;
          };
        };

        return {
          profile: {
            id: data.user?.id?.toString(),
            email: data.user?.email,
            name:
              [data.user?.firstname, data.user?.lastname].filter(Boolean).join(' ') ||
              undefined,
            imageUrl: data.user?.avatar
          }
        };
      } catch {
        return { profile: {} };
      }
    }
  });
