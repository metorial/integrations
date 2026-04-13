import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let accountFieldsSchema = z.object({
  name: z.string().optional().describe('Account/company name'),
  domain: z.string().optional().describe('Company domain, e.g. "apollo.io"'),
  phone: z.string().optional().describe('Company phone number'),
  ownerId: z.string().optional().describe('Apollo user ID of the account owner'),
  accountStageId: z.string().optional().describe('Account stage ID'),
  websiteUrl: z.string().optional().describe('Company website URL'),
  linkedinUrl: z.string().optional().describe('Company LinkedIn URL'),
  city: z.string().optional().describe('City'),
  state: z.string().optional().describe('State or region'),
  country: z.string().optional().describe('Country')
});

export let searchAccounts = SlateTool.create(spec, {
  name: 'Search Accounts',
  key: 'search_accounts',
  description: `Search for accounts (companies) that have been added to your Apollo database. Returns accounts your team has explicitly added — use Search Organizations for the broader Apollo company database.`,
  constraints: [
    'Maximum 50,000 results (100 per page, up to 500 pages)',
    "Only returns accounts in your team's database"
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      keywords: z.string().optional().describe('Keywords to search accounts'),
      accountStageIds: z.array(z.string()).optional().describe('Filter by account stage IDs'),
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
      accounts: z.array(
        z.object({
          accountId: z.string().optional(),
          name: z.string().optional(),
          domain: z.string().optional(),
          websiteUrl: z.string().optional(),
          phone: z.string().optional(),
          ownerId: z.string().optional(),
          accountStageId: z.string().optional(),
          industry: z.string().optional(),
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

    let result = await client.searchAccounts({
      qKeywords: ctx.input.keywords,
      accountStageIds: ctx.input.accountStageIds,
      sortByField: ctx.input.sortByField,
      sortAscending: ctx.input.sortAscending,
      page: ctx.input.page,
      perPage: ctx.input.perPage
    });

    let accounts = result.accounts.map(a => ({
      accountId: a.id,
      name: a.name,
      domain: a.domain,
      websiteUrl: a.website_url,
      phone: a.phone,
      ownerId: a.owner_id,
      accountStageId: a.account_stage_id,
      industry: a.industry,
      linkedinUrl: a.linkedin_url,
      city: a.city,
      state: a.state,
      country: a.country,
      createdAt: a.created_at,
      updatedAt: a.updated_at
    }));

    return {
      output: {
        accounts,
        totalEntries: result.pagination?.total_entries,
        currentPage: result.pagination?.page,
        totalPages: result.pagination?.total_pages
      },
      message: `Found **${result.pagination?.total_entries ?? accounts.length}** accounts (page ${result.pagination?.page ?? 1} of ${result.pagination?.total_pages ?? 1}). Returned ${accounts.length} results.`
    };
  })
  .build();

export let createAccount = SlateTool.create(spec, {
  name: 'Create Account',
  key: 'create_account',
  description: `Create a new account (company) in your Apollo database. Accounts represent companies your team is tracking.`,
  instructions: [
    'Apollo does not deduplicate accounts automatically. If a matching account already exists, a new one will be created.'
  ],
  tags: {
    destructive: false
  }
})
  .input(accountFieldsSchema.required({ name: true }))
  .output(
    z.object({
      accountId: z.string().optional(),
      name: z.string().optional(),
      domain: z.string().optional(),
      websiteUrl: z.string().optional(),
      createdAt: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.createAccount({
      name: ctx.input.name,
      domain: ctx.input.domain,
      phone: ctx.input.phone,
      ownerId: ctx.input.ownerId,
      accountStageId: ctx.input.accountStageId,
      websiteUrl: ctx.input.websiteUrl,
      linkedinUrl: ctx.input.linkedinUrl,
      city: ctx.input.city,
      state: ctx.input.state,
      country: ctx.input.country
    });

    let a = result.account;
    return {
      output: {
        accountId: a.id,
        name: a.name,
        domain: a.domain,
        websiteUrl: a.website_url,
        createdAt: a.created_at
      },
      message: `Created account **${a.name}** (ID: ${a.id}).`
    };
  })
  .build();

export let updateAccount = SlateTool.create(spec, {
  name: 'Update Account',
  key: 'update_account',
  description: `Update an existing account in your Apollo database. Provide the account ID and any fields you want to change. Only the provided fields will be updated.`,
  tags: {
    destructive: false
  }
})
  .input(
    z
      .object({
        accountId: z.string().describe('The Apollo account ID to update')
      })
      .merge(accountFieldsSchema)
  )
  .output(
    z.object({
      accountId: z.string().optional(),
      name: z.string().optional(),
      domain: z.string().optional(),
      websiteUrl: z.string().optional(),
      updatedAt: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.updateAccount(ctx.input.accountId, {
      name: ctx.input.name,
      domain: ctx.input.domain,
      phone: ctx.input.phone,
      ownerId: ctx.input.ownerId,
      accountStageId: ctx.input.accountStageId,
      websiteUrl: ctx.input.websiteUrl,
      linkedinUrl: ctx.input.linkedinUrl,
      city: ctx.input.city,
      state: ctx.input.state,
      country: ctx.input.country
    });

    let a = result.account;
    return {
      output: {
        accountId: a.id,
        name: a.name,
        domain: a.domain,
        websiteUrl: a.website_url,
        updatedAt: a.updated_at
      },
      message: `Updated account **${a.name || a.id}**.`
    };
  })
  .build();
