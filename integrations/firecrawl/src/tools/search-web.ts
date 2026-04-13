import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let searchResultSchema = z.object({
  url: z.string().optional().describe('URL of the search result'),
  title: z.string().optional().describe('Title of the search result'),
  description: z.string().optional().describe('Snippet/description of the search result'),
  markdown: z.string().optional().describe('Full page content as markdown (if scrapeOptions included)'),
  html: z.string().optional().describe('Full page HTML (if requested)'),
});

export let searchWebTool = SlateTool.create(
  spec,
  {
    name: 'Search Web',
    key: 'search_web',
    description: `Search the internet for pages matching a query and optionally extract full content from the results. Combines search with scraping to get both search metadata and full page content in one request.
Supports advanced query operators like exact phrases, site filters, and file type filters.`,
    instructions: [
      'Provide a search query. Supports operators like "exact phrase", site:example.com, -exclude, filetype:pdf.',
      'Set scrapeContent to true to also extract full markdown/HTML content from each result page.',
      'Use categories to filter results (e.g., github, research, pdf).',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    query: z.string().describe('Search query (max 500 characters). Supports operators: "", -, site:, filetype:, intitle:, inurl:'),
    limit: z.number().optional().describe('Number of results to return (default: 5, max: 100)'),
    scrapeContent: z.boolean().optional().describe('If true, scrapes full content from each result page and returns it as markdown'),
    categories: z.array(z.enum(['github', 'research', 'pdf'])).optional().describe('Filter results by category'),
    location: z.string().optional().describe('Geo-target results (e.g., "San Francisco, California, United States")'),
    country: z.string().optional().describe('ISO country code for results (default: US)'),
    timeFilter: z.string().optional().describe('Time-based filter, e.g., qdr:d (last day), qdr:w (last week), qdr:m (last month), qdr:y (last year)'),
  }))
  .output(z.object({
    results: z.array(searchResultSchema).describe('Search results with optional scraped content'),
    creditsUsed: z.number().optional().describe('Credits consumed by the search'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let scrapeOptions = ctx.input.scrapeContent ? { formats: ['markdown' as const] } : undefined;

    let result = await client.search({
      query: ctx.input.query,
      limit: ctx.input.limit,
      categories: ctx.input.categories,
      location: ctx.input.location,
      country: ctx.input.country,
      tbs: ctx.input.timeFilter,
      scrapeOptions,
    });

    let rawResults = result.data?.web ?? result.data ?? [];
    let results = (Array.isArray(rawResults) ? rawResults : []).map((item: any) => ({
      url: item.url,
      title: item.title,
      description: item.description,
      markdown: item.markdown,
      html: item.html,
    }));

    return {
      output: {
        results,
        creditsUsed: result.creditsUsed,
      },
      message: `Found **${results.length}** results for "${ctx.input.query}".${ctx.input.scrapeContent ? ' Full content was scraped from each result.' : ''}`,
    };
  });
