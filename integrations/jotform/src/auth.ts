import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string().describe('JotForm API key')
    })
  )
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',

    inputSchema: z.object({
      token: z.string().describe('Your JotForm API key. Generate one at Settings > API.')
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { token: string } }) => {
      let http = createAxios({
        baseURL: 'https://api.jotform.com',
        headers: {
          APIKEY: ctx.output.token
        }
      });

      let response = await http.get('/user');
      let user = response.data.content;

      return {
        profile: {
          id: user.username,
          email: user.email,
          name: user.name
        }
      };
    }
  });
