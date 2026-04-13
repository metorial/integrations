import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let crawlWebsiteTool = SlateTool.create(
  spec,
  {
    name: 'Crawl Website',
    key: 'crawl_website',
    description: `Start a crawl job to recursively scrape an entire website and extract content from all pages. The crawl runs asynchronously and returns a job ID for tracking progress.
Use this to extract content from multiple pages across a website. Configure page limits, URL filters, and depth to control scope.`,
    instructions: [
      'Provide the base URL to start crawling from.',
      'Use includePaths/excludePaths with regex patterns to filter which URLs to crawl.',
      'The crawl runs asynchronously — use the returned crawlId with the Get Crawl Status tool to check progress and retrieve results.',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    url: z.string().describe('The base URL to start crawling from'),
    limit: z.number().optional().describe('Maximum number of pages to crawl (default: 10000)'),
    maxDiscoveryDepth: z.number().optional().describe('Maximum link depth to follow from the start URL'),
    includePaths: z.array(z.string()).optional().describe('Regex patterns — only crawl URLs matching these patterns'),
    excludePaths: z.array(z.string()).optional().describe('Regex patterns — skip URLs matching these patterns'),
    allowExternalLinks: z.boolean().optional().describe('Follow links to external domains'),
    allowSubdomains: z.boolean().optional().describe('Follow links to subdomains'),
    crawlEntireDomain: z.boolean().optional().describe('Crawl sibling and parent URLs of the start URL'),
    sitemap: z.enum(['skip', 'include', 'only']).optional().describe('How to handle the sitemap: skip, include (default), or only use sitemap URLs'),
    delay: z.number().optional().describe('Seconds to wait between requests for rate limiting'),
    maxConcurrency: z.number().optional().describe('Maximum concurrent scrape operations'),
    formats: z.array(z.enum(['markdown', 'html', 'rawHtml', 'screenshot', 'links'])).optional().describe('Output formats for scraped pages'),
    onlyMainContent: z.boolean().optional().describe('Extract only the main content from each page'),
  }))
  .output(z.object({
    crawlId: z.string().describe('Unique ID for the crawl job, use to check status and retrieve results'),
    url: z.string().optional().describe('Status URL for the crawl job'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let scrapeOptions: Record<string, any> = {};
    if (ctx.input.formats) scrapeOptions.formats = ctx.input.formats;
    if (ctx.input.onlyMainContent !== undefined) scrapeOptions.onlyMainContent = ctx.input.onlyMainContent;

    let result = await client.startCrawl({
      url: ctx.input.url,
      limit: ctx.input.limit,
      maxDiscoveryDepth: ctx.input.maxDiscoveryDepth,
      includePaths: ctx.input.includePaths,
      excludePaths: ctx.input.excludePaths,
      allowExternalLinks: ctx.input.allowExternalLinks,
      allowSubdomains: ctx.input.allowSubdomains,
      crawlEntireDomain: ctx.input.crawlEntireDomain,
      sitemap: ctx.input.sitemap,
      delay: ctx.input.delay,
      maxConcurrency: ctx.input.maxConcurrency,
      scrapeOptions: Object.keys(scrapeOptions).length > 0 ? scrapeOptions : undefined,
    });

    return {
      output: {
        crawlId: result.id,
        url: result.url,
      },
      message: `Started crawl job for **${ctx.input.url}** with ID \`${result.id}\`. Use the "Get Crawl Status" tool to check progress and retrieve results.`,
    };
  });
