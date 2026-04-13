import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let stripeAxios = createAxios({
  baseURL: 'https://api.stripe.com',
});

let connectAxios = createAxios({
  baseURL: 'https://connect.stripe.com',
});

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string().describe('Stripe API secret key or OAuth access token'),
  }))
  .addTokenAuth({
    type: 'auth.token',
    name: 'API Key',
    key: 'api_key',
    inputSchema: z.object({
      token: z.string().describe('Stripe secret API key (starts with sk_live_ or sk_test_)'),
    }),
    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token,
        },
      };
    },
    getProfile: async (ctx: { output: { token: string }; input: { token: string } }) => {
      let response = await stripeAxios.get('/v1/account', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });
      let account = response.data;
      return {
        profile: {
          id: account.id,
          email: account.email || undefined,
          name: account.settings?.dashboard?.display_name || account.business_profile?.name || undefined,
        },
      };
    },
  })
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth (Stripe Connect)',
    key: 'oauth_connect',
    scopes: [
      {
        title: 'Read & Write',
        description: 'Full read and write access to the connected Stripe account',
        scope: 'read_write',
      },
      {
        title: 'Read Only',
        description: 'Read-only access to the connected Stripe account',
        scope: 'read_only',
      },
    ],
    getAuthorizationUrl: async (ctx) => {
      let params = new URLSearchParams({
        response_type: 'code',
        client_id: ctx.clientId,
        scope: ctx.scopes.join(' '),
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
      });

      return {
        url: `https://connect.stripe.com/oauth/authorize?${params.toString()}`,
      };
    },
    handleCallback: async (ctx) => {
      let response = await connectAxios.post('/oauth/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code: ctx.code,
        client_secret: ctx.clientSecret,
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
        },
      };
    },
    handleTokenRefresh: async (ctx) => {
      let response = await connectAxios.post('/oauth/token', new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: ctx.output.token,
        client_secret: ctx.clientSecret,
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
        },
      };
    },
    getProfile: async (ctx: { output: { token: string }; input: {}; scopes: string[] }) => {
      let response = await stripeAxios.get('/v1/account', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
        },
      });
      let account = response.data;
      return {
        profile: {
          id: account.id,
          email: account.email || undefined,
          name: account.settings?.dashboard?.display_name || account.business_profile?.name || undefined,
        },
      };
    },
  });
