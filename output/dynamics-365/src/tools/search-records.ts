import { SlateTool } from 'slates';
import { DynamicsClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let searchRecords = SlateTool.create(
  spec,
  {
    name: 'Search Records',
    key: 'search_records',
    description: `Perform a full-text relevance search across multiple Dynamics 365 entities using the Dataverse Search API. Returns results ranked by relevance, useful for finding records when you don't know the exact entity or field to query.`,
    instructions: [
      'Optionally narrow results by specifying entity names to search within.',
      'The search uses Lucene query syntax. Wrap phrases in quotes for exact matching.',
    ],
    tags: {
      destructive: false,
      readOnly: true,
    },
  }
)
  .input(z.object({
    searchTerm: z.string().describe('Full-text search query'),
    entities: z.array(z.string()).optional().describe('Limit search to specific entity logical names (e.g., ["account", "contact"])'),
    filter: z.string().optional().describe('OData filter to further narrow results'),
    top: z.number().optional().describe('Maximum number of results to return'),
  }))
  .output(z.object({
    results: z.array(z.object({
      entityName: z.string().describe('Logical name of the entity'),
      recordId: z.string().describe('GUID of the matching record'),
      score: z.number().describe('Relevance score'),
      highlights: z.record(z.string(), z.array(z.string())).describe('Highlighted matching fields'),
      attributes: z.record(z.string(), z.any()).describe('Record attributes'),
    })).describe('Search results ranked by relevance'),
    totalCount: z.number().describe('Total number of matching records'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new DynamicsClient({
      token: ctx.auth.token,
      instanceUrl: ctx.auth.instanceUrl || ctx.config.instanceUrl,
    });

    let searchResponse = await client.search(ctx.input.searchTerm, {
      entities: ctx.input.entities,
      filter: ctx.input.filter,
      top: ctx.input.top,
    });

    let results = (searchResponse.value || []).map((item: any) => ({
      entityName: item.entityname || item.objecttypecode || '',
      recordId: item.objectid || item.id || '',
      score: item.score || 0,
      highlights: item.highlights || {},
      attributes: item.attributes || {},
    }));

    return {
      output: {
        results,
        totalCount: searchResponse.totalrecordcount || searchResponse.count || results.length,
      },
      message: `Found **${results.length}** results for "${ctx.input.searchTerm}".`,
    };
  })
  .build();
