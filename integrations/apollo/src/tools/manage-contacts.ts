import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let contactFieldsSchema = z.object({
  firstName: z.string().optional().describe('Contact first name'),
  lastName: z.string().optional().describe('Contact last name'),
  email: z.string().optional().describe('Contact email address'),
  title: z.string().optional().describe('Job title'),
  phone: z.string().optional().describe('Phone number'),
  organizationName: z.string().optional().describe('Company/organization name'),
  ownerId: z.string().optional().describe('Apollo user ID of the contact owner'),
  accountId: z.string().optional().describe('Apollo account ID to associate with'),
  contactStageId: z.string().optional().describe('Contact stage ID'),
  websiteUrl: z.string().optional().describe('Personal or company website URL'),
  linkedinUrl: z.string().optional().describe('LinkedIn profile URL'),
  city: z.string().optional().describe('City'),
  state: z.string().optional().describe('State or region'),
  country: z.string().optional().describe('Country'),
  postalCode: z.string().optional().describe('Postal/ZIP code'),
  labelIds: z.array(z.string()).optional().describe('Label IDs to apply')
});

export let searchContacts = SlateTool.create(spec, {
  name: 'Search Contacts',
  key: 'search_contacts',
  description: `Search for contacts that have been added to your Apollo account. Contacts are people explicitly added to your database (not the broader Apollo search database). Returns enriched contact data including emails and phone numbers.`,
  constraints: [
    'Maximum 50,000 results (100 per page, up to 500 pages)',
    "Only returns contacts in your team's database — use Search People for the broader Apollo database"
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      keywords: z.string().optional().describe('Keywords to search contacts'),
      contactStageIds: z.array(z.string()).optional().describe('Filter by contact stage IDs'),
      sortByField: z.string().optional().describe('Field to sort results by'),
      sortAscending: z
        .boolean()
        .optional()
        .describe('Sort in ascending order (default: false)'),
      page: z.number().optional().describe('Page number (default: 1)'),
      perPage: z.number().optional().describe('Results per page (default: 25, max: 100)')
    })
  )
  .output(
    z.object({
      contacts: z.array(
        z.object({
          contactId: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          name: z.string().optional(),
          email: z.string().optional(),
          emailStatus: z.string().optional(),
          title: z.string().optional(),
          phone: z.string().optional(),
          organizationName: z.string().optional(),
          accountId: z.string().optional(),
          ownerId: z.string().optional(),
          contactStageId: z.string().optional(),
          linkedinUrl: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          createdAt: z.string().optional(),
          updatedAt: z.string().optional()
        })
      ),
      totalEntries: z.number().optional(),
      currentPage: z.number().optional(),
      totalPages: z.number().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.searchContacts({
      qKeywords: ctx.input.keywords,
      contactStageIds: ctx.input.contactStageIds,
      sortByField: ctx.input.sortByField,
      sortAscending: ctx.input.sortAscending,
      page: ctx.input.page,
      perPage: ctx.input.perPage
    });

    let contacts = result.contacts.map(c => ({
      contactId: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      name: c.name || [c.first_name, c.last_name].filter(Boolean).join(' '),
      email: c.email,
      emailStatus: c.email_status,
      title: c.title,
      phone: c.phone_numbers?.[0]?.raw_number,
      organizationName: c.organization_name,
      accountId: c.account_id,
      ownerId: c.owner_id,
      contactStageId: c.contact_stage_id,
      linkedinUrl: c.linkedin_url,
      city: c.city,
      state: c.state,
      country: c.country,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    return {
      output: {
        contacts,
        totalEntries: result.pagination?.total_entries,
        currentPage: result.pagination?.page,
        totalPages: result.pagination?.total_pages
      },
      message: `Found **${result.pagination?.total_entries ?? contacts.length}** contacts (page ${result.pagination?.page ?? 1} of ${result.pagination?.total_pages ?? 1}). Returned ${contacts.length} results.`
    };
  })
  .build();

export let createContact = SlateTool.create(spec, {
  name: 'Create Contact',
  key: 'create_contact',
  description: `Create a new contact in your Apollo account. Contacts are people that your team explicitly adds to the database. Once created, their enriched data is permanently accessible without consuming additional credits.`,
  instructions: [
    'Set runDedupe to true to prevent creating duplicate contacts with matching name, email, or other details.'
  ],
  tags: {
    destructive: false
  }
})
  .input(
    contactFieldsSchema.extend({
      runDedupe: z
        .boolean()
        .optional()
        .describe('Enable deduplication to prevent duplicates (default: false)')
    })
  )
  .output(
    z.object({
      contactId: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      title: z.string().optional(),
      organizationName: z.string().optional(),
      createdAt: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.createContact({
      firstName: ctx.input.firstName,
      lastName: ctx.input.lastName,
      email: ctx.input.email,
      title: ctx.input.title,
      phone: ctx.input.phone,
      organizationName: ctx.input.organizationName,
      ownerId: ctx.input.ownerId,
      accountId: ctx.input.accountId,
      contactStageId: ctx.input.contactStageId,
      websiteUrl: ctx.input.websiteUrl,
      linkedinUrl: ctx.input.linkedinUrl,
      city: ctx.input.city,
      state: ctx.input.state,
      country: ctx.input.country,
      postalCode: ctx.input.postalCode,
      labelIds: ctx.input.labelIds,
      runDedupe: ctx.input.runDedupe
    });

    let c = result.contact;
    return {
      output: {
        contactId: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        title: c.title,
        organizationName: c.organization_name,
        createdAt: c.created_at
      },
      message: `Created contact **${[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}** (ID: ${c.id}).`
    };
  })
  .build();

export let updateContact = SlateTool.create(spec, {
  name: 'Update Contact',
  key: 'update_contact',
  description: `Update an existing contact in your Apollo account. Provide the contact ID and any fields you want to change. Only the provided fields will be updated.`,
  tags: {
    destructive: false
  }
})
  .input(
    z
      .object({
        contactId: z.string().describe('The Apollo contact ID to update')
      })
      .merge(contactFieldsSchema)
  )
  .output(
    z.object({
      contactId: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      title: z.string().optional(),
      organizationName: z.string().optional(),
      updatedAt: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.updateContact(ctx.input.contactId, {
      firstName: ctx.input.firstName,
      lastName: ctx.input.lastName,
      email: ctx.input.email,
      title: ctx.input.title,
      phone: ctx.input.phone,
      organizationName: ctx.input.organizationName,
      ownerId: ctx.input.ownerId,
      accountId: ctx.input.accountId,
      contactStageId: ctx.input.contactStageId,
      websiteUrl: ctx.input.websiteUrl,
      linkedinUrl: ctx.input.linkedinUrl,
      city: ctx.input.city,
      state: ctx.input.state,
      country: ctx.input.country,
      postalCode: ctx.input.postalCode,
      labelIds: ctx.input.labelIds
    });

    let c = result.contact;
    return {
      output: {
        contactId: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        title: c.title,
        organizationName: c.organization_name,
        updatedAt: c.updated_at
      },
      message: `Updated contact **${[c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || c.id}**.`
    };
  })
  .build();
