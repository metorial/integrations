import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let httpClient = createAxios({
  baseURL: 'https://api.fireflies.ai'
});

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string()
    })
  )
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',
    inputSchema: z.object({
      apiKey: z
        .string()
        .describe(
          'Your Fireflies.ai API key. Find it under Integrations > Fireflies API in your dashboard.'
        )
    }),
    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.apiKey
        }
      };
    },
    getProfile: async (ctx: { output: { token: string }; input: { apiKey: string } }) => {
      let response = await httpClient.post(
        '/graphql',
        {
          query: `query { user { user_id name email } }`
        },
        {
          headers: {
            Authorization: `Bearer ${ctx.output.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let user = response.data.data?.user;

      return {
        profile: {
          id: user?.user_id,
          name: user?.name,
          email: user?.email
        }
      };
    }
  });
