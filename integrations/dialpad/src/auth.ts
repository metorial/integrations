import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional()
    })
  )
  .addOauth<{ environment: 'production' | 'sandbox' }>({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Recordings Export',
        description: 'Access recording URLs in call events',
        scope: 'recordings_export'
      },
      {
        title: 'Message Content Export',
        description: 'Export SMS content for the authenticated user',
        scope: 'message_content_export'
      },
      {
        title: 'Message Content Export (All)',
        description: 'Export company-wide SMS content',
        scope: 'message_content_export:all'
      },
      {
        title: 'Screen Pop',
        description: 'Use the screen pop API',
        scope: 'screen_pop'
      },
      {
        title: 'Calls List',
        description: 'Access the Call List API',
        scope: 'calls:list'
      },
      {
        title: 'Fax Message',
        description: 'Access Fax API and Events',
        scope: 'fax_message'
      },
      {
        title: 'Change Log',
        description: 'Create change log event subscriptions',
        scope: 'change_log'
      },
      {
        title: 'Offline Access',
        description: 'Obtain a refresh token to extend OAuth access token duration',
        scope: 'offline_access'
      }
    ],

    inputSchema: z.object({
      environment: z
        .enum(['production', 'sandbox'])
        .default('production')
        .describe('Dialpad environment')
    }),

    getAuthorizationUrl: async ctx => {
      let baseUrl =
        ctx.input.environment === 'sandbox'
          ? 'https://sandbox.dialpad.com'
          : 'https://dialpad.com';

      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        response_type: 'code'
      });

      if (ctx.scopes.length > 0) {
        params.set('scope', ctx.scopes.join(' '));
      }

      return {
        url: `${baseUrl}/oauth2/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let baseUrl =
        ctx.input.environment === 'sandbox'
          ? 'https://sandbox.dialpad.com'
          : 'https://dialpad.com';

      let axios = createAxios({ baseURL: baseUrl });

      let response = await axios.post(
        '/oauth2/token',
        {
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          code: ctx.code,
          grant_type: 'authorization_code',
          redirect_uri: ctx.redirectUri
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      let data = response.data;

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        return { output: ctx.output };
      }

      let baseUrl =
        ctx.input.environment === 'sandbox'
          ? 'https://sandbox.dialpad.com'
          : 'https://dialpad.com';

      let axios = createAxios({ baseURL: baseUrl });

      let response = await axios.post(
        '/oauth2/token',
        {
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      let data = response.data;

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: any) => {
      let baseUrl =
        ctx.input.environment === 'sandbox'
          ? 'https://sandbox.dialpad.com'
          : 'https://dialpad.com';

      let axios = createAxios({ baseURL: baseUrl });

      let response = await axios.get('/api/v2/users/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data;

      return {
        profile: {
          id: String(user.id),
          email: user.emails?.[0],
          name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          imageUrl: user.image_url
        }
      };
    }
  })
  .addTokenAuth<{ apiKey: string }>({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',

    inputSchema: z.object({
      apiKey: z.string().describe('Dialpad API key generated by a Company Admin')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.apiKey
        }
      };
    },

    getProfile: async (ctx: any) => {
      let axios = createAxios({ baseURL: 'https://dialpad.com' });

      let response = await axios.get('/api/v2/users/me', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let user = response.data;

      return {
        profile: {
          id: String(user.id),
          email: user.emails?.[0],
          name: user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          imageUrl: user.image_url
        }
      };
    }
  });
