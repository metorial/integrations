import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let pageDataSchema = z.object({
  markdown: z.string().optional().describe('Page content as markdown'),
  html: z.string().optional().describe('Cleaned HTML content'),
  links: z.array(z.string()).optional().describe('Links found on the page'),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    sourceURL: z.string().optional(),
    statusCode: z.number().optional(),
  }).optional().describe('Page metadata'),
});

export let getCrawlStatusTool = SlateTool.create(
  spec,
  {
    name: 'Get Crawl Status',
    key: 'get_crawl_status',
    description: `Check the status of a crawl job and retrieve the scraped page data. Returns the current progress and any available results.
Also supports cancelling a running crawl job.`,
    instructions: [
      'Provide the crawlId returned by the Crawl Website tool.',
      'If the status is "scraping", the job is still running — check back later for more results.',
      'If results exceed 10MB, a nextUrl will be provided for pagination.',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    crawlId: z.string().describe('The ID of the crawl job to check'),
    cancel: z.boolean().optional().describe('Set to true to cancel the crawl job instead of checking status'),
  }))
  .output(z.object({
    status: z.string().describe('Current status: scraping, completed, or failed'),
    total: z.number().optional().describe('Total pages attempted'),
    completed: z.number().optional().describe('Pages successfully scraped'),
    creditsUsed: z.number().optional().describe('Credits consumed by the crawl'),
    expiresAt: z.string().optional().describe('When the results expire'),
    nextUrl: z.string().optional().describe('URL for retrieving next batch of results if response is large'),
    pages: z.array(pageDataSchema).optional().describe('Array of scraped page data'),
    cancelled: z.boolean().optional().describe('Whether the crawl was cancelled'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    if (ctx.input.cancel) {
      await client.cancelCrawl(ctx.input.crawlId);
      return {
        output: {
          status: 'cancelled',
          cancelled: true,
        },
        message: `Cancelled crawl job \`${ctx.input.crawlId}\`.`,
      };
    }

    let result = await client.getCrawlStatus(ctx.input.crawlId);

    let pages = (result.data ?? []).map((page: any) => ({
      markdown: page.markdown,
      html: page.html,
      links: page.links,
      metadata: page.metadata ? {
        title: page.metadata.title,
        description: page.metadata.description,
        sourceURL: page.metadata.sourceURL ?? page.metadata.url,
        statusCode: page.metadata.statusCode,
      } : undefined,
    }));

    return {
      output: {
        status: result.status,
        total: result.total,
        completed: result.completed,
        creditsUsed: result.creditsUsed,
        expiresAt: result.expiresAt,
        nextUrl: result.next,
        pages,
      },
      message: `Crawl job \`${ctx.input.crawlId}\` is **${result.status}**. Progress: ${result.completed ?? 0}/${result.total ?? '?'} pages. ${pages.length} pages returned in this response.`,
    };
  });
