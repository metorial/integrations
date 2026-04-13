import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let mapWebsiteTool = SlateTool.create(
  spec,
  {
    name: 'Map Website',
    key: 'map_website',
    description: `Rapidly retrieve all URLs associated with a website to get a clear overview of its structure. Returns up to 100,000 URLs.
Use this to discover all pages on a site before deciding which ones to scrape or crawl.`,
    instructions: [
      'Provide the base URL of the website to map.',
      'Optionally use the search parameter to order results by relevance to a topic.',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    url: z.string().describe('The base URL of the website to map'),
    search: z.string().optional().describe('Search term to order results by relevance'),
    includeSubdomains: z.boolean().optional().describe('Include URLs from subdomains (default: true)'),
    ignoreQueryParameters: z.boolean().optional().describe('Exclude URLs with query parameters (default: true)'),
    limit: z.number().optional().describe('Maximum number of URLs to return (default: 5000, max: 100000)'),
    sitemap: z.enum(['skip', 'include', 'only']).optional().describe('How to handle sitemaps: skip, include (default), or only use sitemap URLs'),
  }))
  .output(z.object({
    links: z.array(z.object({
      url: z.string().describe('URL found on the website'),
      title: z.string().optional().describe('Page title if available'),
      description: z.string().optional().describe('Page description if available'),
    })).describe('List of discovered URLs'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.map({
      url: ctx.input.url,
      search: ctx.input.search,
      includeSubdomains: ctx.input.includeSubdomains,
      ignoreQueryParameters: ctx.input.ignoreQueryParameters,
      limit: ctx.input.limit,
      sitemap: ctx.input.sitemap,
    });

    let links = (result.links ?? []).map((link: any) => {
      if (typeof link === 'string') {
        return { url: link };
      }
      return {
        url: link.url,
        title: link.title,
        description: link.description,
      };
    });

    return {
      output: {
        links,
      },
      message: `Mapped **${links.length}** URLs from **${ctx.input.url}**${ctx.input.search ? ` filtered by "${ctx.input.search}"` : ''}.`,
    };
  });
