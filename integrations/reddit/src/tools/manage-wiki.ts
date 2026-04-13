import { SlateTool } from 'slates';
import { RedditClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageWiki = SlateTool.create(spec, {
  name: 'Manage Wiki',
  key: 'manage_wiki',
  description: `Read, edit, and list subreddit wiki pages. View page content, list all pages in a subreddit wiki, or edit page content with an optional revision reason.`,
  tags: {
    readOnly: false
  }
})
  .input(
    z.object({
      action: z
        .enum(['read', 'edit', 'list_pages', 'revisions'])
        .describe('Wiki action to perform'),
      subredditName: z.string().describe('Subreddit name (without r/ prefix)'),
      pageName: z
        .string()
        .optional()
        .describe('Wiki page name (required for read, edit, and revisions)'),
      content: z.string().optional().describe('New page content (required for edit)'),
      reason: z.string().optional().describe('Edit reason/summary (optional for edit)'),
      limit: z.number().optional().describe('Maximum number of revisions to return')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether the action was successful'),
      pageContent: z.string().optional().describe('Wiki page content in markdown'),
      pageContentHtml: z.string().optional().describe('Wiki page content in HTML'),
      revisionDate: z.string().optional().describe('Last revision date'),
      revisionAuthor: z.string().optional().describe('Last revision author'),
      pages: z.array(z.string()).optional().describe('List of wiki page names'),
      revisions: z
        .array(
          z.object({
            revisionId: z.string().optional().describe('Revision ID'),
            author: z.string().optional().describe('Revision author'),
            timestamp: z.string().optional().describe('Revision timestamp'),
            reason: z.string().optional().describe('Edit reason')
          })
        )
        .optional()
        .describe('Page revisions')
    })
  )
  .handleInvocation(async ctx => {
    let client = new RedditClient(ctx.auth.token);
    let { action, subredditName, pageName } = ctx.input;

    if (action === 'list_pages') {
      let data = await client.getWikiPages(subredditName);
      let pages: string[] = data?.data ?? [];
      return {
        output: {
          success: true,
          pages
        },
        message: `Found ${pages.length} wiki pages in r/${subredditName}.`
      };
    }

    if (action === 'edit') {
      await client.editWikiPage(subredditName, pageName!, {
        content: ctx.input.content!,
        reason: ctx.input.reason
      });
      return {
        output: { success: true },
        message: `Edited wiki page "${pageName}" in r/${subredditName}.`
      };
    }

    if (action === 'revisions') {
      let data = await client.getWikiRevisions(subredditName, pageName!, {
        limit: ctx.input.limit ?? 10
      });
      let revisionItems = data?.data ?? [];
      let revisions = (Array.isArray(revisionItems) ? revisionItems : []).map((r: any) => ({
        revisionId: r.id,
        author: r.author?.data?.name,
        timestamp: r.timestamp ? new Date(r.timestamp * 1000).toISOString() : undefined,
        reason: r.reason || undefined
      }));

      return {
        output: {
          success: true,
          revisions
        },
        message: `Found ${revisions.length} revisions for "${pageName}" in r/${subredditName}.`
      };
    }

    // read action
    let data = await client.getWikiPage(subredditName, pageName!);
    let wikiData = data?.data ?? data;

    return {
      output: {
        success: true,
        pageContent: wikiData?.content_md,
        pageContentHtml: wikiData?.content_html,
        revisionDate: wikiData?.revision_date
          ? new Date(wikiData.revision_date * 1000).toISOString()
          : undefined,
        revisionAuthor: wikiData?.revision_by?.data?.name
      },
      message: `Retrieved wiki page "${pageName}" from r/${subredditName}.`
    };
  })
  .build();
