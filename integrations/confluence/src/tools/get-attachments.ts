import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let getAttachments = SlateTool.create(spec, {
  name: 'Get Attachments',
  key: 'get_attachments',
  description: `List file attachments on a Confluence page. Returns attachment metadata including file name, media type, and size.`,
  tags: { readOnly: true }
})
  .input(
    z.object({
      pageId: z.string().describe('The page ID to list attachments for'),
      limit: z
        .number()
        .optional()
        .default(25)
        .describe('Maximum number of attachments to return'),
      cursor: z.string().optional().describe('Pagination cursor')
    })
  )
  .output(
    z.object({
      attachments: z.array(
        z.object({
          attachmentId: z.string(),
          fileName: z.string(),
          status: z.string(),
          mediaType: z.string().optional(),
          fileSize: z.number().optional(),
          versionNumber: z.number().optional(),
          downloadLink: z.string().optional()
        })
      ),
      nextCursor: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx.auth, ctx.config);
    let response = await client.getPageAttachments(ctx.input.pageId, {
      limit: ctx.input.limit,
      cursor: ctx.input.cursor
    });

    let nextLink = response._links?.next;
    let nextCursor: string | undefined;
    if (nextLink) {
      let match = nextLink.match(/cursor=([^&]+)/);
      if (match) nextCursor = decodeURIComponent(match[1]!);
    }

    let attachments = response.results.map(a => ({
      attachmentId: a.id,
      fileName: a.title,
      status: a.status,
      mediaType: a.mediaType,
      fileSize: a.fileSize,
      versionNumber: a.version?.number,
      downloadLink: a.downloadLink
    }));

    return {
      output: { attachments, nextCursor },
      message: `Found **${attachments.length}** attachments on page ${ctx.input.pageId}`
    };
  })
  .build();
