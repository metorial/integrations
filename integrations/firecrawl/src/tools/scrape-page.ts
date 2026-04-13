import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let actionSchema = z
  .object({
    type: z
      .enum(['wait', 'click', 'fill', 'press', 'scroll', 'screenshot', 'executeJavascript'])
      .describe('Type of browser action to perform'),
    selector: z
      .string()
      .optional()
      .describe('CSS selector for the target element (for wait, click, fill actions)'),
    milliseconds: z
      .number()
      .optional()
      .describe('Duration to wait in milliseconds (for wait action)'),
    text: z
      .string()
      .optional()
      .describe('Text to fill or key to press (for fill, press actions)'),
    direction: z
      .enum(['up', 'down'])
      .optional()
      .describe('Scroll direction (for scroll action)'),
    amount: z.number().optional().describe('Scroll amount in pixels (for scroll action)'),
    script: z
      .string()
      .optional()
      .describe('JavaScript code to execute (for executeJavascript action)')
  })
  .describe('A browser action to perform before extracting content');

export let scrapePageTool = SlateTool.create(spec, {
  name: 'Scrape Page',
  key: 'scrape_page',
  description: `Scrape a single URL and extract its content as markdown, HTML, screenshot, or structured data. Handles JavaScript-rendered pages and dynamic content automatically.
Use this to get clean, readable content from any web page. Supports browser automation actions like clicking buttons, filling forms, and scrolling before extraction.`,
  instructions: [
    'Provide the URL you want to scrape. By default, content is returned as markdown.',
    'Use the formats array to request additional output types like html, rawHtml, screenshot, or links.',
    'Use actions to interact with the page before scraping (e.g., clicking a cookie banner or loading more content).'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      url: z.string().describe('The URL of the web page to scrape'),
      formats: z
        .array(z.enum(['markdown', 'html', 'rawHtml', 'screenshot', 'links']))
        .optional()
        .describe('Output formats to return. Defaults to markdown if not specified.'),
      onlyMainContent: z
        .boolean()
        .optional()
        .describe(
          'Extract only the main content, excluding navigation, footers, etc. Defaults to true.'
        ),
      includeTags: z
        .array(z.string())
        .optional()
        .describe('Only include content from these CSS selectors'),
      excludeTags: z
        .array(z.string())
        .optional()
        .describe('Exclude content matching these CSS selectors'),
      waitFor: z
        .number()
        .optional()
        .describe('Milliseconds to wait before extracting content'),
      mobile: z.boolean().optional().describe('Emulate a mobile device when scraping'),
      timeout: z.number().optional().describe('Request timeout in seconds (max 300)'),
      actions: z
        .array(actionSchema)
        .optional()
        .describe('Browser actions to perform before extracting content')
    })
  )
  .output(
    z.object({
      markdown: z.string().optional().describe('Page content as clean markdown'),
      html: z.string().optional().describe('Cleaned HTML content'),
      rawHtml: z.string().optional().describe('Raw unmodified HTML content'),
      screenshot: z.string().optional().describe('Screenshot URL or base64 data'),
      links: z.array(z.string()).optional().describe('Links found on the page'),
      metadata: z
        .object({
          title: z.string().optional().describe('Page title'),
          description: z.string().optional().describe('Page meta description'),
          language: z.string().optional().describe('Page language'),
          sourceURL: z.string().optional().describe('Original URL'),
          statusCode: z.number().optional().describe('HTTP status code')
        })
        .optional()
        .describe('Page metadata'),
      actions: z.any().optional().describe('Results from browser actions performed')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.scrape(ctx.input.url, {
      formats: ctx.input.formats,
      onlyMainContent: ctx.input.onlyMainContent,
      includeTags: ctx.input.includeTags,
      excludeTags: ctx.input.excludeTags,
      waitFor: ctx.input.waitFor,
      mobile: ctx.input.mobile,
      timeout: ctx.input.timeout,
      actions: ctx.input.actions
    });

    let data = result.data ?? result;

    return {
      output: {
        markdown: data.markdown,
        html: data.html,
        rawHtml: data.rawHtml,
        screenshot: data.screenshot,
        links: data.links,
        metadata: data.metadata
          ? {
              title: data.metadata.title,
              description: data.metadata.description,
              language: data.metadata.language,
              sourceURL: data.metadata.sourceURL ?? data.metadata.url,
              statusCode: data.metadata.statusCode
            }
          : undefined,
        actions: data.actions
      },
      message: `Successfully scraped **${ctx.input.url}**${data.metadata?.title ? ` — "${data.metadata.title}"` : ''}. Returned formats: ${(ctx.input.formats ?? ['markdown']).join(', ')}.`
    };
  });
