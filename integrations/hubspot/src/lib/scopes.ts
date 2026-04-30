import { allOf, anyOf } from 'slates';

export type HubSpotScopeDefinition = {
  title: string;
  description: string;
  scope: string;
};

// These lists must stay in lockstep with the HubSpot app's Auth scope settings.
export let hubSpotRequiredOAuthScopes: HubSpotScopeDefinition[] = [
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

// Sequences and custom objects are product/tier-gated; required scopes break OAuth on
// portals without access.
export let hubSpotOptionalOAuthScopes: HubSpotScopeDefinition[] = [
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
  {
    title: 'CRM Contact Schemas Write',
    description: 'Create and update contact property settings',
    scope: 'crm.schemas.contacts.write'
  },
  {
    title: 'CRM Company Schemas Write',
    description: 'Create and update company property settings',
    scope: 'crm.schemas.companies.write'
  },
  {
    title: 'CRM Deal Schemas Write',
    description: 'Create and update deal property settings',
    scope: 'crm.schemas.deals.write'
  },
  {
    title: 'CRM Custom Schemas Read',
    description: 'Read custom object schemas (Enterprise)',
    scope: 'crm.schemas.custom.read'
  },
  {
    title: 'CRM Custom Schemas Write',
    description: 'Create and update custom object schemas (Enterprise)',
    scope: 'crm.schemas.custom.write'
  },
  {
    title: 'Order Pipelines Read',
    description: 'Read order pipelines',
    scope: 'crm.pipelines.orders.read'
  },
  {
    title: 'Order Pipelines Write',
    description: 'Create and update order pipelines',
    scope: 'crm.pipelines.orders.write'
  },
  { title: 'Files', description: 'File Manager', scope: 'files' },
  { title: 'E-Commerce', description: 'Products and line items', scope: 'e-commerce' },
  { title: 'Social', description: 'Social media', scope: 'social' }
];

export let hubSpotRequiredScopeValues = hubSpotRequiredOAuthScopes.map(({ scope }) => scope);
export let hubSpotOptionalScopeValues = hubSpotOptionalOAuthScopes.map(({ scope }) => scope);

export let parseHubSpotGrantedScopes = (value?: unknown) => {
  if (Array.isArray(value)) {
    return value.map(scope => String(scope).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\s]+/)
      .map(scope => scope.trim())
      .filter(Boolean);
  }

  return [];
};

let contactRead = 'crm.objects.contacts.read';
let contactWrite = 'crm.objects.contacts.write';
let companyRead = 'crm.objects.companies.read';
let companyWrite = 'crm.objects.companies.write';
let dealRead = 'crm.objects.deals.read';
let dealWrite = 'crm.objects.deals.write';
let ticketAccess = 'tickets';
let customObjectRead = 'crm.objects.custom.read';
let customObjectWrite = 'crm.objects.custom.write';

let standardObjectRead = anyOf(contactRead, companyRead, dealRead, ticketAccess);
let crmObjectRead = anyOf(contactRead, companyRead, dealRead, ticketAccess, customObjectRead);
let crmObjectWrite = anyOf(
  contactWrite,
  companyWrite,
  dealWrite,
  ticketAccess,
  customObjectWrite
);
let propertyRead = anyOf(
  'crm.schemas.contacts.read',
  'crm.schemas.companies.read',
  'crm.schemas.deals.read',
  'crm.schemas.custom.read',
  ticketAccess
);
let propertyWrite = anyOf(
  'crm.schemas.contacts.write',
  'crm.schemas.companies.write',
  'crm.schemas.deals.write',
  'crm.schemas.custom.write',
  ticketAccess
);
let pipelineRead = anyOf(dealRead, ticketAccess, 'crm.pipelines.orders.read');
let pipelineWrite = anyOf(dealWrite, ticketAccess, 'crm.pipelines.orders.write');
let engagementRead = anyOf('timeline', 'sales-email-read');
let engagementWrite = anyOf('timeline');

export let hubSpotActionScopes = {
  createContact: allOf(contactWrite),
  getContact: allOf(contactRead),
  updateContact: allOf(contactWrite),
  deleteContact: allOf(contactWrite),
  listContacts: allOf(contactRead),
  createCompany: allOf(companyWrite),
  getCompany: allOf(companyRead),
  updateCompany: allOf(companyWrite),
  deleteCompany: allOf(companyWrite),
  listCompanies: allOf(companyRead),
  createDeal: allOf(dealWrite),
  getDeal: allOf(dealRead),
  updateDeal: allOf(dealWrite),
  deleteDeal: allOf(dealWrite),
  listDeals: allOf(dealRead),
  createTicket: allOf(ticketAccess),
  getTicket: allOf(ticketAccess),
  updateTicket: allOf(ticketAccess),
  deleteTicket: allOf(ticketAccess),
  listTickets: allOf(ticketAccess),
  searchCrm: crmObjectRead,
  createAssociation: crmObjectWrite,
  getAssociations: crmObjectRead,
  deleteAssociation: crmObjectWrite,
  createList: allOf('crm.lists.write'),
  getList: allOf('crm.lists.read'),
  updateListMembership: allOf('crm.lists.write'),
  deleteList: allOf('crm.lists.write'),
  searchLists: allOf('crm.lists.read'),
  listPipelines: pipelineRead,
  getPipeline: pipelineRead,
  createPipeline: pipelineWrite,
  deletePipeline: pipelineWrite,
  listProperties: propertyRead,
  createProperty: propertyWrite,
  listOwners: allOf('crm.objects.owners.read'),
  getOwner: allOf('crm.objects.owners.read'),
  createEngagement: engagementWrite,
  getEngagement: engagementRead,
  updateEngagement: engagementWrite,
  deleteEngagement: engagementWrite,
  crmObjectChanges: standardObjectRead,
  crmObjectWebhook: standardObjectRead
};
