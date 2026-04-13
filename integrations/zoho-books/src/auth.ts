import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(
    z.object({
      token: z.string(),
      refreshToken: z.string().optional(),
      expiresAt: z.string().optional(),
      accountsUrl: z.string().optional()
    })
  )
  .addOauth({
    type: 'auth.oauth',
    name: 'Zoho OAuth',
    key: 'zoho_oauth',

    scopes: [
      {
        title: 'Full Access',
        description: 'Full access to all Zoho Books resources',
        scope: 'ZohoBooks.fullaccess.all'
      },
      {
        title: 'Contacts',
        description: 'Read and manage customers and vendors',
        scope: 'ZohoBooks.contacts.ALL'
      },
      {
        title: 'Contacts (Read)',
        description: 'Read-only access to customers and vendors',
        scope: 'ZohoBooks.contacts.READ'
      },
      {
        title: 'Settings',
        description: 'Read and manage items, taxes, currencies, users, and other settings',
        scope: 'ZohoBooks.settings.ALL'
      },
      {
        title: 'Settings (Read)',
        description: 'Read-only access to items, taxes, currencies, users, and other settings',
        scope: 'ZohoBooks.settings.READ'
      },
      {
        title: 'Invoices',
        description: 'Read and manage invoices',
        scope: 'ZohoBooks.invoices.ALL'
      },
      {
        title: 'Invoices (Read)',
        description: 'Read-only access to invoices',
        scope: 'ZohoBooks.invoices.READ'
      },
      {
        title: 'Estimates',
        description: 'Read and manage estimates/quotes',
        scope: 'ZohoBooks.estimates.ALL'
      },
      {
        title: 'Estimates (Read)',
        description: 'Read-only access to estimates/quotes',
        scope: 'ZohoBooks.estimates.READ'
      },
      {
        title: 'Customer Payments',
        description: 'Read and manage payments received',
        scope: 'ZohoBooks.customerpayments.ALL'
      },
      {
        title: 'Customer Payments (Read)',
        description: 'Read-only access to payments received',
        scope: 'ZohoBooks.customerpayments.READ'
      },
      {
        title: 'Credit Notes',
        description: 'Read and manage credit notes',
        scope: 'ZohoBooks.creditnotes.ALL'
      },
      {
        title: 'Credit Notes (Read)',
        description: 'Read-only access to credit notes',
        scope: 'ZohoBooks.creditnotes.READ'
      },
      {
        title: 'Projects',
        description: 'Read and manage projects and time tracking',
        scope: 'ZohoBooks.projects.ALL'
      },
      {
        title: 'Projects (Read)',
        description: 'Read-only access to projects and time tracking',
        scope: 'ZohoBooks.projects.READ'
      },
      {
        title: 'Expenses',
        description: 'Read and manage expenses',
        scope: 'ZohoBooks.expenses.ALL'
      },
      {
        title: 'Expenses (Read)',
        description: 'Read-only access to expenses',
        scope: 'ZohoBooks.expenses.READ'
      },
      {
        title: 'Sales Orders',
        description: 'Read and manage sales orders',
        scope: 'ZohoBooks.salesorders.ALL'
      },
      {
        title: 'Sales Orders (Read)',
        description: 'Read-only access to sales orders',
        scope: 'ZohoBooks.salesorders.READ'
      },
      {
        title: 'Purchase Orders',
        description: 'Read and manage purchase orders',
        scope: 'ZohoBooks.purchaseorders.ALL'
      },
      {
        title: 'Purchase Orders (Read)',
        description: 'Read-only access to purchase orders',
        scope: 'ZohoBooks.purchaseorders.READ'
      },
      {
        title: 'Bills',
        description: 'Read and manage bills',
        scope: 'ZohoBooks.bills.ALL'
      },
      {
        title: 'Bills (Read)',
        description: 'Read-only access to bills',
        scope: 'ZohoBooks.bills.READ'
      },
      {
        title: 'Debit Notes',
        description: 'Read and manage vendor credits',
        scope: 'ZohoBooks.debitnotes.ALL'
      },
      {
        title: 'Debit Notes (Read)',
        description: 'Read-only access to vendor credits',
        scope: 'ZohoBooks.debitnotes.READ'
      },
      {
        title: 'Vendor Payments',
        description: 'Read and manage payments made',
        scope: 'ZohoBooks.vendorpayments.ALL'
      },
      {
        title: 'Vendor Payments (Read)',
        description: 'Read-only access to payments made',
        scope: 'ZohoBooks.vendorpayments.READ'
      },
      {
        title: 'Banking',
        description: 'Read and manage banking transactions',
        scope: 'ZohoBooks.banking.ALL'
      },
      {
        title: 'Banking (Read)',
        description: 'Read-only access to banking transactions',
        scope: 'ZohoBooks.banking.READ'
      },
      {
        title: 'Accountants',
        description: 'Read and manage accountant module',
        scope: 'ZohoBooks.accountants.ALL'
      },
      {
        title: 'Accountants (Read)',
        description: 'Read-only access to accountant module',
        scope: 'ZohoBooks.accountants.READ'
      }
    ],

    inputSchema: z.object({
      region: z
        .enum(['.com', '.eu', '.in', '.com.au', '.jp', '.ca', '.com.cn', '.sa'])
        .default('.com')
        .describe('Zoho region domain suffix for your account')
    }),

    getAuthorizationUrl: async ctx => {
      let accountsUrl = `https://accounts.zoho${ctx.input.region}`;
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        scope: ctx.scopes.join(','),
        redirect_uri: ctx.redirectUri,
        state: ctx.state,
        access_type: 'offline',
        prompt: 'consent'
      });

      return {
        url: `${accountsUrl}/oauth/v2/auth?${params.toString()}`,
        input: { region: ctx.input.region }
      };
    },

    handleCallback: async ctx => {
      let accountsUrl = `https://accounts.zoho${ctx.input.region}`;
      let httpClient = createAxios({ baseURL: accountsUrl });

      let response = await httpClient.post('/oauth/v2/token', null, {
        params: {
          grant_type: 'authorization_code',
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          code: ctx.code
        }
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
          accountsUrl
        },
        input: { region: ctx.input.region }
      };
    },

    handleTokenRefresh: async ctx => {
      let accountsUrl = ctx.output.accountsUrl || `https://accounts.zoho${ctx.input.region}`;
      let httpClient = createAxios({ baseURL: accountsUrl });

      let response = await httpClient.post('/oauth/v2/token', null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: ctx.output.refreshToken,
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret
        }
      });

      let data = response.data;

      return {
        output: {
          token: data.access_token,
          refreshToken: ctx.output.refreshToken,
          expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
          accountsUrl
        },
        input: { region: ctx.input.region }
      };
    },

    getProfile: async (ctx: any) => {
      let accountsUrl = ctx.output.accountsUrl || `https://accounts.zoho${ctx.input.region}`;
      let httpClient = createAxios({ baseURL: accountsUrl });

      let response = await httpClient.get('/oauth/user/info', {
        headers: {
          Authorization: `Zoho-oauthtoken ${ctx.output.token}`
        }
      });

      let user = response.data;

      return {
        profile: {
          id: user.ZUID?.toString(),
          email: user.Email,
          name: user.Display_Name || `${user.First_Name || ''} ${user.Last_Name || ''}`.trim()
        }
      };
    }
  });
