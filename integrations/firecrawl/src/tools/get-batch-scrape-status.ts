import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let pageDataSchema = z.object({
  markdown: z.string().optional().describe('Page content as markdown'),
  html: z.string().optional().describe('Cleaned HTML content'),
  links: z.array(z.string()).optional().describe('Links found on the page'),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      sourceURL: z.string().optional(),
      statusCode: z.number().optional()
    })
    .optional()
    .describe('Page metadata')
});

export let getBatchScrapeStatusTool = SlateTool.create(spec, {
  name: 'Get Batch Scrape Status',
  key: 'get_batch_scrape_status',
  description: `Check the status of a batch scrape job and retrieve the scraped page data when available.`,
  instructions: [
    'Provide the batchId returned by the Batch Scrape tool.',
    'If status is "scraping", the job is still in progress.',
    'If results exceed 10MB, a nextUrl will be provided for pagination.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      batchId: z.string().describe('The ID of the batch scrape job to check')
    })
  )
  .output(
    z.object({
      status: z.string().describe('Current status: scraping, completed, or failed'),
      total: z.number().optional().describe('Total URLs in the batch'),
      completed: z.number().optional().describe('URLs successfully scraped'),
      creditsUsed: z.number().optional().describe('Credits consumed'),
      expiresAt: z.string().optional().describe('When the results expire'),
      nextUrl: z.string().optional().describe('URL for retrieving next batch of results'),
      pages: z.array(pageDataSchema).optional().describe('Array of scraped page data')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.getBatchScrapeStatus(ctx.input.batchId);

    let pages = (result.data ?? []).map((page: any) => ({
      markdown: page.markdown,
      html: page.html,
      links: page.links,
      metadata: page.metadata
        ? {
            title: page.metadata.title,
            description: page.metadata.description,
            sourceURL: page.metadata.sourceURL ?? page.metadata.url,
            statusCode: page.metadata.statusCode
          }
        : undefined
    }));

    return {
      output: {
        status: result.status,
        total: result.total,
        completed: result.completed,
        creditsUsed: result.creditsUsed,
        expiresAt: result.expiresAt,
        nextUrl: result.next,
        pages
      },
      message: `Batch scrape \`${ctx.input.batchId}\` is **${result.status}**. Progress: ${result.completed ?? 0}/${result.total ?? '?'} pages. ${pages.length} pages returned.`
    };
  });
