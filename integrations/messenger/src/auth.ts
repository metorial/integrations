import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string().describe('Page Access Token for Messenger API calls'),
    pageId: z.string().optional().describe('The Facebook Page ID associated with the token')
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'Facebook OAuth',
    key: 'facebook_oauth',

    scopes: [
      {
        title: 'Pages Messaging',
        description: 'Send and receive messages on behalf of a Page',
        scope: 'pages_messaging'
      },
      {
        title: 'Pages Manage Metadata',
        description: 'Configure the Facebook app to send webhook events',
        scope: 'pages_manage_metadata'
      },
      {
        title: 'Pages Show List',
        description: 'Query the list of Pages that a person manages',
        scope: 'pages_show_list'
      },
      {
        title: 'Pages Read Engagement',
        description: 'Read Page content, follower data, and metadata',
        scope: 'pages_read_engagement'
      }
    ],

    inputSchema: z.object({
      pageId: z.string().optional().describe('Facebook Page ID to obtain the access token for. If not provided, the first available page will be used.')
    }),

    getAuthorizationUrl: async (ctx) => {
      let scopeString = ctx.scopes.join(',');
      let url = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${encodeURIComponent(ctx.clientId)}&redirect_uri=${encodeURIComponent(ctx.redirectUri)}&state=${encodeURIComponent(ctx.state)}&scope=${encodeURIComponent(scopeString)}`;

      return { url, input: ctx.input };
    },

    handleCallback: async (ctx) => {
      let graphApi = createAxios({ baseURL: 'https://graph.facebook.com/v21.0' });

      // Exchange code for user access token
      let tokenResponse = await graphApi.get('/oauth/access_token', {
        params: {
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          code: ctx.code
        }
      });

      let userAccessToken = tokenResponse.data.access_token as string;

      // Exchange short-lived token for long-lived token
      let longLivedResponse = await graphApi.get('/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          fb_exchange_token: userAccessToken
        }
      });

      let longLivedUserToken = longLivedResponse.data.access_token as string;

      // Get list of pages the user manages
      let pagesResponse = await graphApi.get('/me/accounts', {
        params: { access_token: longLivedUserToken }
      });

      let pages = pagesResponse.data.data as Array<{ id: string; name: string; access_token: string }>;

      if (!pages || pages.length === 0) {
        throw new Error('No Facebook Pages found. Please ensure you have admin access to at least one Page.');
      }

      // Find the requested page or use the first one
      let targetPageId = ctx.input.pageId;
      let page = targetPageId
        ? pages.find(p => p.id === targetPageId)
        : pages[0];

      if (!page) {
        throw new Error(`Page with ID ${targetPageId} not found. Available pages: ${pages.map(p => `${p.name} (${p.id})`).join(', ')}`);
      }

      return {
        output: {
          token: page.access_token,
          pageId: page.id
        },
        input: {
          pageId: page.id
        }
      };
    },

    handleTokenRefresh: async (ctx) => {
      // Page access tokens derived from long-lived user tokens are non-expiring
      // If token refresh is needed, re-authorize
      return {
        output: ctx.output
      };
    },

    getProfile: async (ctx: { output: { token: string; pageId?: string }; input: { pageId?: string }; scopes: string[] }) => {
      let graphApi = createAxios({ baseURL: 'https://graph.facebook.com/v21.0' });

      let pageId = ctx.output.pageId || 'me';
      let response = await graphApi.get(`/${pageId}`, {
        params: {
          fields: 'id,name,picture',
          access_token: ctx.output.token
        }
      });

      let data = response.data as { id?: string; name?: string; picture?: { data?: { url?: string } } };

      return {
        profile: {
          id: data.id,
          name: data.name,
          imageUrl: data.picture?.data?.url
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Page Access Token',
    key: 'page_access_token',

    inputSchema: z.object({
      token: z.string().describe('A valid Facebook Page Access Token'),
      pageId: z.string().optional().describe('The Facebook Page ID associated with this token')
    }),

    getOutput: async (ctx) => {
      return {
        output: {
          token: ctx.input.token,
          pageId: ctx.input.pageId
        }
      };
    },

    getProfile: async (ctx: { output: { token: string; pageId?: string }; input: { token: string; pageId?: string } }) => {
      let graphApi = createAxios({ baseURL: 'https://graph.facebook.com/v21.0' });

      let pageId = ctx.output.pageId || 'me';
      let response = await graphApi.get(`/${pageId}`, {
        params: {
          fields: 'id,name,picture',
          access_token: ctx.output.token
        }
      });

      let data = response.data as { id?: string; name?: string; picture?: { data?: { url?: string } } };

      return {
        profile: {
          id: data.id,
          name: data.name,
          imageUrl: data.picture?.data?.url
        }
      };
    }
  });
