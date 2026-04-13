import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let batchScrapeTool = SlateTool.create(spec, {
  name: 'Batch Scrape',
  key: 'batch_scrape',
  description: `Scrape multiple URLs simultaneously. Submit an array of URLs and receive results asynchronously. Supports the same format and configuration options as single page scraping.`,
  instructions: [
    'Provide an array of URLs to scrape.',
    'The batch runs asynchronously — use the returned batchId with the Get Batch Scrape Status tool to check progress and retrieve results.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      urls: z.array(z.string()).describe('List of URLs to scrape'),
      formats: z
        .array(z.enum(['markdown', 'html', 'rawHtml', 'screenshot', 'links']))
        .optional()
        .describe('Output formats for scraped pages'),
      onlyMainContent: z
        .boolean()
        .optional()
        .describe('Extract only main content from each page'),
      maxConcurrency: z.number().optional().describe('Maximum concurrent scrape operations')
    })
  )
  .output(
    z.object({
      batchId: z.string().describe('Unique ID for the batch scrape job'),
      url: z.string().optional().describe('Status URL for the batch job')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let scrapeOptions: Record<string, any> = {};
    if (ctx.input.formats) scrapeOptions.formats = ctx.input.formats;
    if (ctx.input.onlyMainContent !== undefined)
      scrapeOptions.onlyMainContent = ctx.input.onlyMainContent;

    let result = await client.startBatchScrape({
      urls: ctx.input.urls,
      scrapeOptions: Object.keys(scrapeOptions).length > 0 ? scrapeOptions : undefined,
      maxConcurrency: ctx.input.maxConcurrency
    });

    return {
      output: {
        batchId: result.id,
        url: result.url
      },
      message: `Started batch scrape for **${ctx.input.urls.length}** URLs with ID \`${result.id}\`. Use the "Get Batch Scrape Status" tool to check progress.`
    };
  });
