import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let searchPages = SlateTool.create(spec, {
  name: 'Search Pages',
  key: 'search_pages',
  description: `Full-text search across all OneNote pages accessible by the authenticated user. Searches page titles and content, including OCR text from images.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      query: z.string().describe('The search query text'),
      top: z.number().optional().describe('Maximum number of results to return'),
      skip: z.number().optional().describe('Number of results to skip for pagination'),
      filter: z.string().optional().describe('OData filter expression to narrow results')
    })
  )
  .output(
    z.object({
      pages: z.array(
        z.object({
          pageId: z.string(),
          title: z.string(),
          createdDateTime: z.string(),
          lastModifiedDateTime: z.string(),
          parentSectionId: z.string().optional()
        })
      ),
      nextLink: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.searchPages(ctx.input.query, {
      top: ctx.input.top,
      skip: ctx.input.skip,
      filter: ctx.input.filter
    });

    return {
      output: {
        pages: result.pages.map(p => ({
          pageId: p.pageId,
          title: p.title,
          createdDateTime: p.createdDateTime,
          lastModifiedDateTime: p.lastModifiedDateTime,
          parentSectionId: p.parentSectionId
        })),
        nextLink: result.nextLink
      },
      message: `Found **${result.pages.length}** page(s) matching "${ctx.input.query}".`
    };
  })
  .build();
