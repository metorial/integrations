import { SlateAuth, axios } from 'slates';
import { z } from 'zod';
import { getAccountsUrl, getApiBaseUrl, datacenterFromLocation } from './lib/urls';
import type { Datacenter } from './lib/urls';

export let auth = SlateAuth.create()
  .output(z.object({
    token: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().optional(),
    datacenter: z.string().optional(),
  }))
  .addOauth({
    type: 'auth.oauth',
    name: 'OAuth',
    key: 'oauth',

    scopes: [
      // CRM scopes
      { title: 'CRM - Full Access', description: 'Full access to all CRM modules', scope: 'ZohoCRM.modules.ALL' },
      { title: 'CRM - Read Records', description: 'Read access to CRM records', scope: 'ZohoCRM.modules.READ' },
      { title: 'CRM - Settings', description: 'Access CRM settings including modules metadata', scope: 'ZohoCRM.settings.ALL' },
      { title: 'CRM - Notifications', description: 'Manage CRM notification/watch subscriptions', scope: 'ZohoCRM.notifications.ALL' },
      { title: 'CRM - COQL', description: 'Execute COQL queries against CRM data', scope: 'ZohoCRM.coql.READ' },
      { title: 'CRM - Bulk Read', description: 'Bulk read CRM data', scope: 'ZohoCRM.bulk.READ' },
      { title: 'CRM - Users', description: 'Access CRM user information', scope: 'ZohoCRM.users.READ' },

      // Desk scopes
      { title: 'Desk - Tickets', description: 'Full access to support tickets', scope: 'Desk.tickets.ALL' },
      { title: 'Desk - Read Tickets', description: 'Read access to support tickets', scope: 'Desk.tickets.READ' },
      { title: 'Desk - Contacts', description: 'Full access to Desk contacts', scope: 'Desk.contacts.ALL' },
      { title: 'Desk - Settings', description: 'Access Desk settings and departments', scope: 'Desk.settings.ALL' },
      { title: 'Desk - Events', description: 'Manage Desk webhook subscriptions', scope: 'Desk.events.ALL' },
      { title: 'Desk - Search', description: 'Search across Desk resources', scope: 'Desk.search.READ' },
      { title: 'Desk - Basic', description: 'Basic Desk access', scope: 'Desk.basic.ALL' },

      // Books scopes
      { title: 'Books - Full Access', description: 'Full access to Zoho Books', scope: 'ZohoBooks.fullaccess.all' },
      { title: 'Books - Invoices', description: 'Manage invoices in Zoho Books', scope: 'ZohoBooks.invoices.ALL' },
      { title: 'Books - Read Invoices', description: 'Read invoices in Zoho Books', scope: 'ZohoBooks.invoices.READ' },
      { title: 'Books - Contacts', description: 'Manage contacts in Zoho Books', scope: 'ZohoBooks.contacts.ALL' },
      { title: 'Books - Expenses', description: 'Manage expenses in Zoho Books', scope: 'ZohoBooks.expenses.ALL' },
      { title: 'Books - Settings', description: 'Access Zoho Books settings and organizations', scope: 'ZohoBooks.settings.READ' },

      // People scopes
      { title: 'People - Full Access', description: 'Full access to Zoho People data', scope: 'ZohoPeople.forms.ALL' },
      { title: 'People - Read', description: 'Read access to Zoho People data', scope: 'ZohoPeople.forms.READ' },
      { title: 'People - Attendance', description: 'Manage attendance records', scope: 'ZohoPeople.attendance.ALL' },
      { title: 'People - Leave', description: 'Manage leave records', scope: 'ZohoPeople.leave.ALL' },
      { title: 'People - Timesheet', description: 'Manage timesheets', scope: 'ZohoPeople.timetracker.ALL' },

      // Projects scopes
      { title: 'Projects - Full Access', description: 'Full access to Zoho Projects', scope: 'ZohoProjects.portals.ALL' },
      { title: 'Projects - Read', description: 'Read access to Zoho Projects', scope: 'ZohoProjects.portals.READ' },
      { title: 'Projects - Tasks', description: 'Manage tasks in Zoho Projects', scope: 'ZohoProjects.tasks.ALL' },
      { title: 'Projects - Timesheets', description: 'Manage project timesheets', scope: 'ZohoProjects.timesheets.ALL' },
      { title: 'Projects - Bugs', description: 'Manage bugs in Zoho Projects', scope: 'ZohoProjects.bugs.ALL' },

      // Profile scope
      { title: 'Profile', description: 'Access user profile information', scope: 'AaaServer.profile.READ' },
    ],

    inputSchema: z.object({
      datacenter: z.enum(['us', 'eu', 'in', 'au', 'jp', 'ca']).default('us').describe('Zoho data center region'),
    }),

    getAuthorizationUrl: async (ctx) => {
      let dc = (ctx.input.datacenter || 'us') as Datacenter;
      let accountsUrl = getAccountsUrl(dc);
      let scopeString = ctx.scopes.join(',');

      let params = new URLSearchParams({
        client_id: ctx.clientId,
        response_type: 'code',
        redirect_uri: ctx.redirectUri,
        scope: scopeString,
        access_type: 'offline',
        state: ctx.state,
        prompt: 'consent',
      });

      return {
        url: `${accountsUrl}/oauth/v2/auth?${params.toString()}`,
        input: { datacenter: dc },
      };
    },

    handleCallback: async (ctx) => {
      let dc = (ctx.input.datacenter || 'us') as Datacenter;
      let accountsUrl = getAccountsUrl(dc);

      let response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
        params: {
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'authorization_code',
          code: ctx.code,
          redirect_uri: ctx.redirectUri,
        },
      });

      let data = response.data;

      // If the response includes a location, use that datacenter going forward
      if (data.location) {
        dc = datacenterFromLocation(data.location);
      }

      let expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined;

      return {
        output: {
          token: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt,
          datacenter: dc,
        },
        input: { datacenter: dc },
      };
    },

    handleTokenRefresh: async (ctx) => {
      let dc = (ctx.output.datacenter || ctx.input.datacenter || 'us') as Datacenter;
      let accountsUrl = getAccountsUrl(dc);

      let response = await axios.post(`${accountsUrl}/oauth/v2/token`, null, {
        params: {
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: ctx.output.refreshToken,
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
          datacenter: dc,
        },
      };
    },

    getProfile: async (ctx: any) => {
      let dc = (ctx.output.datacenter || 'us') as Datacenter;
      let accountsUrl = getAccountsUrl(dc);

      let response = await axios.get(`${accountsUrl}/oauth/user/info`, {
        headers: {
          Authorization: `Zoho-oauthtoken ${ctx.output.token}`,
        },
      });

      let data = response.data;

      return {
        profile: {
          id: data.ZUID?.toString(),
          email: data.Email,
          name: data.Display_Name || `${data.First_Name || ''} ${data.Last_Name || ''}`.trim(),
        },
      };
    },
  });
