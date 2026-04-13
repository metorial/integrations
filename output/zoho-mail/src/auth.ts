import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
    accountId: z.string().optional().describe('Primary Zoho Mail account ID'),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Messages - Full Access',
        description: 'Send, read, update, and delete emails',
        scope: 'ZohoMail.messages.ALL',
      },
      {
        title: 'Messages - Read',
        description: 'Read email messages',
        scope: 'ZohoMail.messages.READ',
      },
      {
        title: 'Accounts - Full Access',
        description: 'Read and update user account settings',
        scope: 'ZohoMail.accounts.ALL',
      },
      {
        title: 'Accounts - Read',
        description: 'Read user account settings',
        scope: 'ZohoMail.accounts.READ',
      },
      {
        title: 'Folders - Full Access',
        description: 'Create, read, update, and delete email folders',
        scope: 'ZohoMail.folders.ALL',
      },
      {
        title: 'Folders - Read',
        description: 'Read email folders',
        scope: 'ZohoMail.folders.READ',
      },
      {
        title: 'Labels - Full Access',
        description: 'Create, read, update, and delete email labels',
        scope: 'ZohoMail.tags.ALL',
      },
      {
        title: 'Labels - Read',
        description: 'Read email labels',
        scope: 'ZohoMail.tags.READ',
      },
      {
        title: 'Tasks - Full Access',
        description: 'Create, read, update, and delete tasks',
        scope: 'ZohoMail.tasks.ALL',
      },
      {
        title: 'Tasks - Read',
        description: 'Read tasks',
        scope: 'ZohoMail.tasks.READ',
      },
      {
        title: 'Notes - Full Access',
        description: 'Create, read, update, and delete notes',
        scope: 'ZohoMail.notes.ALL',
      },
      {
        title: 'Notes - Read',
        description: 'Read notes',
        scope: 'ZohoMail.notes.READ',
      },
      {
        title: 'Bookmarks - Full Access',
        description: 'Create, read, update, and delete bookmarks',
        scope: 'ZohoMail.links.ALL',
      },
      {
        title: 'Bookmarks - Read',
        description: 'Read bookmarks',
        scope: 'ZohoMail.links.READ',
      },
      {
        title: 'Organization Accounts - Full Access',
        description: 'Manage organization user accounts (admin)',
        scope: 'ZohoMail.organization.accounts.ALL',
      },
      {
        title: 'Organization Accounts - Read',
        description: 'Read organization user accounts (admin)',
        scope: 'ZohoMail.organization.accounts.READ',
      },
      {
        title: 'Organization Domains - Full Access',
        description: 'Manage organization domains (admin)',
        scope: 'ZohoMail.organization.domains.ALL',
      },
      {
        title: 'Organization Groups - Full Access',
        description: 'Manage organization groups (admin)',
        scope: 'ZohoMail.organization.groups.ALL',
      },
      {
        title: 'Organization Policy - Full Access',
        description: 'Manage mail policies (admin)',
        scope: 'ZohoMail.organization.policy.ALL',
      },
      {
        title: 'Organization Spam - Full Access',
        description: 'Manage anti-spam settings (admin)',
        scope: 'ZohoMail.organization.spam.ALL',
      },
      {
        title: 'Organization Subscriptions - Read',
        description: 'Read storage and subscription details (admin)',
        scope: 'ZohoMail.organization.subscriptions.READ',
      },
      {
        title: 'Organization Audit - Read',
        description: 'Read audit logs (admin)',
        scope: 'ZohoMail.organization.audit.READ',
      },
      {
        title: 'Partner Organization - Full Access',
        description: 'Manage partner/child organizations',
        scope: 'ZohoMail.partner.organization.ALL',
      },
    ],

    inputSchema: z.object({
      dataCenterDomain: z.string().default('zoho.com').describe('Zoho data center domain (e.g. zoho.com, zoho.eu, zoho.in)'),
    }),

    getAuthorizationUrl: async (ctx) => {
      let domain = ctx.input.dataCenterDomain || 'zoho.com';
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: ctx.scopes.join(','),
        access_type: 'offline',
        state: ctx.state,
        prompt: 'consent',
      });

      return {
        url: `https://accounts.${domain}/oauth/v2/auth?${params.toString()}`,
        input: { dataCenterDomain: domain },
      };
    },

    handleCallback: async (ctx) => {
      let domain = ctx.input.dataCenterDomain || 'zoho.com';
      let accountsAxios = createAxios({
        baseURL: `https://accounts.${domain}`,
      });

      let response = await accountsAxios.post('/oauth/v2/token', null, {
        params: {
          code: ctx.code,
          grant_type: 'authorization_code',
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
        },
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      // Fetch primary account ID
      let accountId: string | undefined;
      try {
        let mailAxios = createAxios({
          baseURL: `https://mail.${domain}`,
          headers: {
            Authorization: `Zoho-oauthtoken ${data.access_token}`,
          },
        });
        let accountsResponse = await mailAxios.get('/api/accounts');
        if (accountsResponse.data?.data?.[0]?.accountId) {
          accountId = String(accountsResponse.data.data[0].accountId);
        }
      } catch {
        // Account ID fetch is optional
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          accountId,
        },
        input: { dataCenterDomain: domain },
      };
    },

    handleTokenRefresh: async (ctx) => {
      let domain = ctx.input.dataCenterDomain || 'zoho.com';
      let accountsAxios = createAxios({
        baseURL: `https://accounts.${domain}`,
      });

      let response = await accountsAxios.post('/oauth/v2/token', null, {
        params: {
          refresh_token: ctx.output.refreshToken,
          grant_type: 'refresh_token',
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
        },
      });

      let data = response.data;
      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt,
          accountId: ctx.output.accountId,
        },
      };
    },

    getProfile: async (ctx: { output: { token: string }; input: { dataCenterDomain?: string }; scopes: string[] }) => {
      let domain = ctx.input.dataCenterDomain || 'zoho.com';
      let mailAxios = createAxios({
        baseURL: `https://mail.${domain}`,
        headers: {
          Authorization: `Zoho-oauthtoken ${ctx.output.token}`,
        },
      });

      let response = await mailAxios.get('/api/accounts');
      let account = response.data?.data?.[0];

      return {
        profile: {
          id: account?.accountId ? String(account.accountId) : undefined,
          email: account?.emailAddress?.[0]?.mailId || account?.primaryEmailAddress,
          name: [account?.firstName, account?.lastName].filter(Boolean).join(' ') || undefined,
        },
      };
    },
  });
