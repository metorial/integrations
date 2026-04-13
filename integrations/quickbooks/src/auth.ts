import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let oauthAxios = createAxios({
  baseURL: 'https://oauth.platform.intuit.com'
});

let userInfoAxios = createAxios({
  baseURL: 'https://accounts.platform.intuit.com'
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
    name: 'QuickBooks OAuth',
    key: 'quickbooks_oauth',

    scopes: [
      {
        title: 'Accounting',
        description:
          'Access to accounting data including invoices, customers, vendors, accounts, and more',
        scope: 'com.intuit.quickbooks.accounting'
      },
      {
        title: 'Payments',
        description:
          'Access to payment processing features for credit cards and bank account transactions',
        scope: 'com.intuit.quickbooks.payment'
      },
      {
        title: 'OpenID',
        description: 'OpenID Connect authentication',
        scope: 'openid'
      },
      {
        title: 'Profile',
        description: 'Access to user profile information',
        scope: 'profile'
      },
      {
        title: 'Email',
        description: 'Access to user email address',
        scope: 'email'
      }
    ],

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        scope: ctx.scopes.join(' '),
        state: ctx.state
      });

      return {
        url: `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await oauthAxios.post(
        '/oauth2/v1/tokens/bearer',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: ctx.code,
          redirect_uri: ctx.redirectUri
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
          }
        }
      );

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    handleTokenRefresh: async ctx => {
      let credentials = btoa(`${ctx.clientId}:${ctx.clientSecret}`);

      let response = await oauthAxios.post(
        '/oauth2/v1/tokens/bearer',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: ctx.output.refreshToken || ''
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json'
          }
        }
      );

      let data = response.data;
      let expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        }
      };
    },

    getProfile: async (ctx: {
      output: { token: string; refreshToken?: string; expiresAt?: string };
      input: {};
      scopes: string[];
    }) => {
      let response = await userInfoAxios.get('/v1/openid_connect/userinfo', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`,
          Accept: 'application/json'
        }
      });

      let data = response.data;

      return {
        profile: {
          id: data.sub,
          email: data.email,
          name: [data.givenName, data.familyName].filter(Boolean).join(' ') || data.email
        }
      };
    }
  });
