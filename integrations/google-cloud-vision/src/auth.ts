import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      authMethod: z.enum(['api_key', 'oauth'])
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Google OAuth 2.0',
    key: 'google_oauth',

    scopes: [
      {
        title: 'Cloud Platform',
        description: 'Full access to Google Cloud Platform resources including Cloud Vision',
        scope: 'https://www.googleapis.com/auth/cloud-platform'
      },
      {
        title: 'Cloud Vision',
        description: 'Access to Google Cloud Vision API',
        scope: 'https://www.googleapis.com/auth/cloud-vision'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state,
        access_type: 'offline',
        prompt: 'consent'
      });

      return {
        url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let axios = createAxios();

      let response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code: ctx.code,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          grant_type: 'authorization_code'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          authMethod: 'oauth' as const
        }
      };
    },

    handleTokenRefresh: async ctx => {
      let axios = createAxios();

      let response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.token,
          grant_type: 'refresh_token'
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          authMethod: 'oauth' as const
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',

    inputSchema: z.object({
      token: z.string().describe('Google Cloud API key with Vision API enabled')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token,
          authMethod: 'api_key' as const
        }
      };
    }
  });
