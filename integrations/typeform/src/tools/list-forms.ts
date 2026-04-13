import { SlateTool } from 'slates';
import { TypeformClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listForms = SlateTool.create(spec, {
  name: 'List Forms',
  key: 'list_forms',
  description: `Retrieve a list of typeforms in your account. Optionally filter by search term, workspace, or sort order. Returns form metadata including titles, links, and timestamps.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      search: z.string().optional().describe('Search term to filter forms by title'),
      workspaceId: z.string().optional().describe('Filter forms by workspace ID'),
      page: z.number().optional().describe('Page number for pagination (starts at 1)'),
      pageSize: z
        .number()
        .optional()
        .describe('Number of forms per page (default 10, max 200)'),
      sort: z.string().optional().describe('Sort order, e.g. "created_at,desc" or "title,asc"')
    })
  )
  .output(
    z.object({
      totalItems: z.number().describe('Total number of forms matching the query'),
      pageCount: z.number().describe('Total number of pages'),
      forms: z
        .array(
          z.object({
            formId: z.string().describe('Unique form ID'),
            title: z.string().describe('Form title'),
            lastUpdatedAt: z.string().optional().describe('Last update timestamp (ISO 8601)'),
            createdAt: z.string().optional().describe('Creation timestamp (ISO 8601)'),
            selfUrl: z.string().optional().describe('API URL for this form'),
            displayUrl: z.string().optional().describe('Public display URL for this form'),
            status: z.string().optional().describe('Form status (e.g. "public", "closed")')
          })
        )
        .describe('Array of forms')
    })
  )
  .handleInvocation(async ctx => {
    let client = new TypeformClient({
      token: ctx.auth.token,
      baseUrl: ctx.config.baseUrl
    });

    let result = await client.listForms({
      search: ctx.input.search,
      workspaceId: ctx.input.workspaceId,
      page: ctx.input.page,
      pageSize: ctx.input.pageSize,
      sort: ctx.input.sort
    });

    let forms = (result.items || []).map((f: any) => ({
      formId: f.id,
      title: f.title,
      lastUpdatedAt: f.last_updated_at,
      createdAt: f.created_at,
      selfUrl: f.self?.href,
      displayUrl: f._links?.display,
      status: f.settings?.status
    }));

    return {
      output: {
        totalItems: result.total_items || 0,
        pageCount: result.page_count || 0,
        forms
      },
      message: `Found **${result.total_items || 0}** forms${ctx.input.search ? ` matching "${ctx.input.search}"` : ''}.`
    };
  })
  .build();
