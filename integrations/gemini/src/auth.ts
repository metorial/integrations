import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string().describe('Gemini API key')
    })
  )
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',
    inputSchema: z.object({
      token: z.string().describe('Your Gemini API key from Google AI Studio')
    }),
    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },
    getProfile: async (ctx: any) => {
      let axios = createAxios({
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        headers: {
          'x-goog-api-key': ctx.output.token
        }
      });

      let response = await axios.get('/models', { params: { pageSize: 1 } });

      return {
        profile: {
          id: 'gemini-user',
          name: 'Gemini API User'
        }
      };
    }
  });
