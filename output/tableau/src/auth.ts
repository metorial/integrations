import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string().describe('Tableau credentials token for API requests'),
    siteId: z.string().describe('Site LUID returned from sign-in'),
    userId: z.string().describe('User LUID returned from sign-in')
  }))
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Personal Access Token',
    key: 'personal_access_token',

    inputSchema: z.object({
      serverUrl: z.string().describe('Tableau Server or Cloud URL'),
      siteContentUrl: z.string().default('').describe('Site content URL'),
      apiVersion: z.string().default('3.27').describe('API version'),
      tokenName: z.string().describe('Personal access token name'),
      tokenSecret: z.string().describe('Personal access token secret')
    }),

    getOutput: async (ctx) => {
      let { serverUrl, siteContentUrl, apiVersion, tokenName, tokenSecret } = ctx.input;

      let baseUrl = serverUrl.replace(/\/+$/, '');
      let http = createAxios({ baseURL: baseUrl });

      let response = await http.post(`/api/${apiVersion}/auth/signin`, {
        credentials: {
          personalAccessTokenName: tokenName,
          personalAccessTokenSecret: tokenSecret,
          site: {
            contentUrl: siteContentUrl
          }
        }
      });

      let credentials = response.data.credentials;

      return {
        output: {
          token: credentials.token,
          siteId: credentials.site.id,
          userId: credentials.user.id
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; siteId: string; userId: string }; input: any }) => {
      return {
        profile: {
          id: ctx.output.userId,
          siteId: ctx.output.siteId
        }
      };
    }
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Username & Password',
    key: 'username_password',

    inputSchema: z.object({
      serverUrl: z.string().describe('Tableau Server or Cloud URL'),
      siteContentUrl: z.string().default('').describe('Site content URL'),
      apiVersion: z.string().default('3.27').describe('API version'),
      username: z.string().describe('Tableau username'),
      password: z.string().describe('Tableau password')
    }),

    getOutput: async (ctx) => {
      let { serverUrl, siteContentUrl, apiVersion, username, password } = ctx.input;

      let baseUrl = serverUrl.replace(/\/+$/, '');
      let http = createAxios({ baseURL: baseUrl });

      let response = await http.post(`/api/${apiVersion}/auth/signin`, {
        credentials: {
          name: username,
          password: password,
          site: {
            contentUrl: siteContentUrl
          }
        }
      });

      let credentials = response.data.credentials;

      return {
        output: {
          token: credentials.token,
          siteId: credentials.site.id,
          userId: credentials.user.id
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; siteId: string; userId: string }; input: any }) => {
      return {
        profile: {
          id: ctx.output.userId,
          siteId: ctx.output.siteId
        }
      };
    }
  });
