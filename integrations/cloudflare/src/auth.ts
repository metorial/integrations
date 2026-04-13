import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    email: z.string().optional(),
    authType: z.enum(['api_token', 'global_api_key']),
  }))
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Token',
    key: 'api_token',

    inputSchema: z.object({
      token: z.string().describe('Cloudflare API Token. Create one from My Profile > API Tokens in the Cloudflare dashboard.'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token,
          authType: 'api_token' as const,
        },
      };
    },

    getProfile: async (ctx: any) => {
      let http = createAxios({
        baseURL: 'https://api.cloudflare.com/client/v4',
        headers: {
          'Authorization': `Bearer ${ctx.output.token}`,
        },
      });

      let response = await http.get('/user/tokens/verify');
      let tokenData = response.data.result;

      let userResponse = await http.get('/user');
      let userData = userResponse.data.result;

      return {
        profile: {
          id: userData.id,
          email: userData.email,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
        },
      };
    },
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Global API Key',
    key: 'global_api_key',

    inputSchema: z.object({
      token: z.string().describe('Cloudflare Global API Key. Found in My Profile > API Tokens > Global API Key.'),
      email: z.string().describe('Cloudflare account email address associated with the Global API Key.'),
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token,
          email: ctx.input.email,
          authType: 'global_api_key' as const,
        },
      };
    },

    getProfile: async (ctx: any) => {
      let http = createAxios({
        baseURL: 'https://api.cloudflare.com/client/v4',
        headers: {
          'X-Auth-Email': ctx.output.email!,
          'X-Auth-Key': ctx.output.token,
        },
      });

      let response = await http.get('/user');
      let userData = response.data.result;

      return {
        profile: {
          id: userData.id,
          email: userData.email,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email,
        },
      };
    },
  });
