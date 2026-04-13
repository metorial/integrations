import { SlateAuth, createAxios } from 'slates';
import { z } from 'zod';

type HubSpotScopeDefinition = {
  title: string;
  description: string;
  scope: string;
};

// These lists must stay in lockstep with the HubSpot app's Auth scope settings.
let requiredScopeDefinitions: HubSpotScopeDefinition[] = [
  { title: 'Contacts Read', description: 'Read contacts', scope: 'crm.objects.contacts.read' },
  {
    title: 'Contacts Write',
    description: 'Write contacts',
    scope: 'crm.objects.contacts.write'
  },
  {
    title: 'Companies Read',
    description: 'Read companies',
    scope: 'crm.objects.companies.read'
  },
  {
    title: 'Companies Write',
    description: 'Write companies',
    scope: 'crm.objects.companies.write'
  },
  { title: 'Deals Read', description: 'Read deals', scope: 'crm.objects.deals.read' },
  { title: 'Deals Write', description: 'Write deals', scope: 'crm.objects.deals.write' },
  { title: 'Lists Read', description: 'Read contact lists', scope: 'crm.lists.read' },
  { title: 'Lists Write', description: 'Write contact lists', scope: 'crm.lists.write' },
  { title: 'OAuth', description: 'Required base scope for all public apps', scope: 'oauth' },
  {
    title: 'CRM Contact Schemas Read',
    description: 'Read contact schemas',
    scope: 'crm.schemas.contacts.read'
  },
  {
    title: 'CRM Company Schemas Read',
    description: 'Read company schemas',
    scope: 'crm.schemas.companies.read'
  },
  {
    title: 'CRM Deal Schemas Read',
    description: 'Read deal schemas',
    scope: 'crm.schemas.deals.read'
  },
  { title: 'Owners Read', description: 'Read CRM owners', scope: 'crm.objects.owners.read' },
  { title: 'Tickets Read', description: 'Read tickets', scope: 'tickets' },
  {
    title: 'Timeline',
    description: 'Access CRM timeline events and engagements',
    scope: 'timeline'
  },
  {
    title: 'Sales Email Read',
    description: 'Read sales email data',
    scope: 'sales-email-read'
  },
  { title: 'Quotes Read', description: 'Read quotes', scope: 'crm.objects.quotes.read' },
  { title: 'Quotes Write', description: 'Write quotes', scope: 'crm.objects.quotes.write' },
  { title: 'Content', description: 'CMS, blog, email, landing pages', scope: 'content' },
  { title: 'Automation', description: 'Workflows', scope: 'automation' },
  { title: 'Forms', description: 'Forms', scope: 'forms' },
  {
    title: 'Forms External Integrations',
    description: 'External integrations forms access',
    scope: 'external_integrations.forms.access'
  },
  {
    title: 'Forms Uploaded Files',
    description: 'Read uploaded files on forms',
    scope: 'forms-uploaded-files'
  }
];

// Sequences are product/tier-gated; required scope breaks OAuth on portals without access.
let optionalScopeDefinitions: HubSpotScopeDefinition[] = [
  {
    title: 'Automation Sequences Read',
    description: 'Read marketing / sales sequences (requires eligible HubSpot products)',
    scope: 'automation.sequences.read'
  },
  {
    title: 'Automation Sequences Enrollments Write',
    description: 'Enroll contacts in sequences (requires eligible HubSpot products)',
    scope: 'automation.sequences.enrollments.write'
  },
  {
    title: 'Custom Objects Read',
    description: 'Read custom objects (Enterprise)',
    scope: 'crm.objects.custom.read'
  },
  {
    title: 'Custom Objects Write',
    description: 'Write custom objects (Enterprise)',
    scope: 'crm.objects.custom.write'
  },
  { title: 'Files', description: 'File Manager', scope: 'files' },
  { title: 'E-Commerce', description: 'Products and line items', scope: 'e-commerce' },
  { title: 'Social', description: 'Social media', scope: 'social' }
];

let requiredScopes = requiredScopeDefinitions.map(({ scope }) => scope);
let optionalScopes = optionalScopeDefinitions.map(({ scope }) => scope);

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

    // Only declare scopes that must be granted for a successful connection.
    // HubSpot may drop optional scopes for portals that do not support them.
    scopes: requiredScopeDefinitions,

    getAuthorizationUrl: async ctx => {
      let params = new URLSearchParams({
        client_id: ctx.clientId,
        redirect_uri: ctx.redirectUri,
        scope: requiredScopes.join(' '),
        state: ctx.state
      });

      if (optionalScopes.length > 0) {
        params.set('optional_scope', optionalScopes.join(' '));
      }

      return {
        url: `https://app.hubspot.com/oauth/authorize?${params.toString()}`
      };
    },

    handleCallback: async ctx => {
      let httpClient = createAxios({ baseURL: 'https://api.hubapi.com' });

      let response = await httpClient.post(
        '/oauth/v1/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          redirect_uri: ctx.redirectUri,
          code: ctx.code
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
      let httpClient = createAxios({ baseURL: 'https://api.hubapi.com' });

      let response = await httpClient.post(
        '/oauth/v1/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: ctx.clientId,
          client_secret: ctx.clientSecret,
          refresh_token: ctx.output.refreshToken || ''
        }).toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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

    getProfile: async (ctx: any) => {
      let httpClient = createAxios({ baseURL: 'https://api.hubapi.com' });

      let tokenInfo = await httpClient.get('/oauth/v1/access-tokens/' + ctx.output.token);
      let data = tokenInfo.data;

      return {
        profile: {
          id: String(data.user_id),
          email: data.user,
          name: data.user,
          hubId: String(data.hub_id),
          hubDomain: data.hub_domain
        }
      };
    }
  })
  .addTokenAuth({
    type: 'auth.token',
    name: 'Private App Token',
    key: 'private_app_token',

    inputSchema: z.object({
      token: z
        .string()
        .describe(
          'Private App access token from HubSpot Settings > Integrations > Private Apps'
        )
    }),

    getOutput: async ctx => {
      return {
        output: {
          token: ctx.input.token
        }
      };
    },

    getProfile: async (ctx: any) => {
      let httpClient = createAxios({ baseURL: 'https://api.hubapi.com' });

      let response = await httpClient.get('/account-info/v3/details', {
        headers: { Authorization: `Bearer ${ctx.output.token}` }
      });

      let data = response.data;

      return {
        profile: {
          id: String(data.portalId),
          name: data.accountType || 'HubSpot Account',
          hubId: String(data.portalId)
        }
      };
    }
  });
