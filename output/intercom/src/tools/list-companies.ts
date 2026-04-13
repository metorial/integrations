import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listCompanies = SlateTool.create(
  spec,
  {
    name: 'List Companies',
    key: 'list_companies',
    description: `List or search companies in Intercom. Supports both listing all companies with pagination and searching with Intercom's query syntax.`,
    instructions: [
      'Use "list" mode for paginated listing of all companies.',
      'Use "search" mode with a query filter for targeted searches.'
    ],
    tags: {
      readOnly: true
    }
  }
)
  .input(z.object({
    mode: z.enum(['list', 'search']).default('list').describe('Whether to list all companies or search with a query'),
    query: z.any().optional().describe('Search query using Intercom filter syntax (required for search mode)'),
    page: z.number().optional().describe('Page number for list mode'),
    perPage: z.number().optional().describe('Results per page'),
    paginationCursor: z.string().optional().describe('Cursor for next page (search mode)')
  }))
  .output(z.object({
    companies: z.array(z.object({
      intercomCompanyId: z.string().describe('Intercom company ID'),
      companyId: z.string().optional().describe('External company ID'),
      name: z.string().optional().describe('Company name'),
      plan: z.string().optional().describe('Plan name'),
      size: z.number().optional().describe('Company size'),
      userCount: z.number().optional().describe('Number of users'),
      createdAt: z.string().optional().describe('Creation timestamp')
    })).describe('List of companies'),
    totalCount: z.number().optional().describe('Total number of companies'),
    hasMore: z.boolean().describe('Whether more results are available')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token, region: ctx.config.region });

    let result: any;
    if (ctx.input.mode === 'search' && ctx.input.query) {
      result = await client.searchCompanies(ctx.input.query, ctx.input.paginationCursor, ctx.input.perPage);
    } else {
      result = await client.listCompanies({ page: ctx.input.page, perPage: ctx.input.perPage });
    }

    let companies = (result.data || []).map((c: any) => ({
      intercomCompanyId: c.id,
      companyId: c.company_id,
      name: c.name,
      plan: c.plan?.name,
      size: c.size,
      userCount: c.user_count,
      createdAt: c.created_at ? String(c.created_at) : undefined
    }));

    return {
      output: {
        companies,
        totalCount: result.total_count,
        hasMore: !!(result.pages?.next)
      },
      message: `Found **${result.total_count ?? companies.length}** companies (showing ${companies.length})`
    };
  }).build();
