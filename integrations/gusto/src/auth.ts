import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

let BASE_URLS: Record<string, string> = {
  production: 'https://api.gusto.com',
  demo: 'https://api.gusto-demo.com'
};

let getBaseUrl = (environment?: string): string => {
  return BASE_URLS[environment || 'production'] || BASE_URLS['production']!;
};

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
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      {
        title: 'Companies Read',
        description: 'Read company information',
        scope: 'companies:read'
      },
      {
        title: 'Companies Write',
        description: 'Create and update company information',
        scope: 'companies:write'
      },
      {
        title: 'Employees Read',
        description: 'Read employee information',
        scope: 'employees:read'
      },
      {
        title: 'Employees Write',
        description: 'Create and update employee information',
        scope: 'employees:write'
      },
      {
        title: 'Payrolls Read',
        description: 'Read payroll information',
        scope: 'payrolls:read'
      },
      {
        title: 'Payrolls Write',
        description: 'Create and process payrolls',
        scope: 'payrolls:write'
      },
      {
        title: 'Contractors Read',
        description: 'Read contractor information',
        scope: 'contractors:read'
      },
      {
        title: 'Contractors Write',
        description: 'Create and update contractor information',
        scope: 'contractors:write'
      },
      {
        title: 'Contractor Payments Read',
        description: 'Read contractor payment information',
        scope: 'contractor_payments:read'
      },
      {
        title: 'Contractor Payments Write',
        description: 'Create and manage contractor payments',
        scope: 'contractor_payments:write'
      },
      {
        title: 'Company Benefits Read',
        description: 'Read company benefit information',
        scope: 'company_benefits:read'
      },
      {
        title: 'Company Benefits Write',
        description: 'Create and update company benefits',
        scope: 'company_benefits:write'
      },
      {
        title: 'Employee Benefits Read',
        description: 'Read employee benefit enrollments',
        scope: 'employee_benefits:read'
      },
      {
        title: 'Employee Benefits Write',
        description: 'Create and update employee benefit enrollments',
        scope: 'employee_benefits:write'
      },
      {
        title: 'Pay Schedules Read',
        description: 'Read pay schedule information',
        scope: 'pay_schedules:read'
      },
      {
        title: 'Pay Schedules Write',
        description: 'Create and update pay schedules',
        scope: 'pay_schedules:write'
      },
      {
        title: 'Locations Read',
        description: 'Read company location information',
        scope: 'locations:read'
      },
      {
        title: 'Locations Write',
        description: 'Create and update company locations',
        scope: 'locations:write'
      },
      {
        title: 'Bank Accounts Read',
        description: 'Read bank account information',
        scope: 'bank_accounts:read'
      },
      {
        title: 'Bank Accounts Write',
        description: 'Create and update bank accounts',
        scope: 'bank_accounts:write'
      },
      { title: 'Jobs Read', description: 'Read job information', scope: 'jobs:read' },
      {
        title: 'Jobs Write',
        description: 'Create and update job information',
        scope: 'jobs:write'
      },
      {
        title: 'Compensations Read',
        description: 'Read compensation information',
        scope: 'compensations:read'
      },
      {
        title: 'Compensations Write',
        description: 'Create and update compensation information',
        scope: 'compensations:write'
      },
      { title: 'Taxes Read', description: 'Read tax information', scope: 'taxes:read' },
      { title: 'Taxes Write', description: 'Update tax information', scope: 'taxes:write' },
      { title: 'Forms Read', description: 'Read forms and documents', scope: 'forms:read' },
      { title: 'Forms Write', description: 'Create and manage forms', scope: 'forms:write' },
      {
        title: 'Time Off Policies Read',
        description: 'Read time off policies and balances',
        scope: 'time_off_policies:read'
      },
      {
        title: 'Time Off Policies Write',
        description: 'Create and update time off policies',
        scope: 'time_off_policies:write'
      },
      {
        title: 'Signatories Read',
        description: 'Read signatory information',
        scope: 'signatories:read'
      },
      {
        title: 'Signatories Write',
        description: 'Create and update signatories',
        scope: 'signatories:write'
      },
      {
        title: 'Earning Types Read',
        description: 'Read earning type information',
        scope: 'earning_types:read'
      },
      {
        title: 'Earning Types Write',
        description: 'Create and update earning types',
        scope: 'earning_types:write'
      },
      {
        title: 'Garnishments Read',
        description: 'Read garnishment information',
        scope: 'garnishments:read'
      },
      {
        title: 'Garnishments Write',
        description: 'Create and update garnishments',
        scope: 'garnishments:write'
      },
      {
        title: 'Departments Read',
        description: 'Read department information',
        scope: 'departments:read'
      },
      {
        title: 'Departments Write',
        description: 'Create and update departments',
        scope: 'departments:write'
      },
      {
        title: 'Webhooks Read',
        description: 'Read webhook subscriptions',
        scope: 'webhooks:read'
      },
      {
        title: 'Webhooks Write',
        description: 'Create and manage webhook subscriptions',
        scope: 'webhooks:write'
      }
    ],

    inputSchema: z.object({
      environment: z
        .enum(['production', 'demo'])
        .default('production')
        .describe('Gusto API environment')
    }),

    getAuthorizationUrl: async ctx => {
      let baseUrl = getBaseUrl(ctx.input.environment);
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        response_type: 'code',
        state: ctx.state
      });

      return {
        url: `${baseUrl}/oauth/authorize?${params.toString()}`,
        input: ctx.input
      };
    },

    handleCallback: async ctx => {
      let baseUrl = getBaseUrl(ctx.input.environment);
      let http = createAxios({ baseURL: baseUrl });

      let response = await http.post('/oauth/token', {
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        redirect_uri: ctx.redirectUri,
        code: ctx.code,
        grant_type: 'authorization_code'
      });

      let data = response.data;

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt
        },
        input: ctx.input
      };
    },

    handleTokenRefresh: async ctx => {
      if (!ctx.output.refreshToken) {
        throw new Error('No refresh token available');
      }

      let baseUrl = getBaseUrl(ctx.input.environment);
      let http = createAxios({ baseURL: baseUrl });

      let response = await http.post('/oauth/token', {
        client_id: ctx.clientId,
        client_secret: ctx.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: ctx.output.refreshToken
      });

      let data = response.data;

      let expiresAt: string | undefined;
      if (data.expires_in) {
        expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
      }

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token || ctx.output.refreshToken,
          expiresAt
        },
        input: ctx.input
      };
    },

    getProfile: async (ctx: any) => {
      let baseUrl = getBaseUrl(ctx.input.environment);
      let http = createAxios({ baseURL: baseUrl });

      let response = await http.get('/v1/me', {
        headers: {
          Authorization: `Bearer ${ctx.output.token}`
        }
      });

      let user = response.data;

      return {
        profile: {
          id: user.uuid || user.id?.toString(),
          email: user.email,
          name: user.name
        }
      };
    }
  });
