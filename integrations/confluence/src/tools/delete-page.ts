import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClient } from '../lib/helpers';
import { z } from 'zod';

export let deletePage = SlateTool.create(spec, {
  name: 'Delete Page',
  key: 'delete_page',
  description: `Delete a Confluence page by ID. The page is moved to trash and can be restored later.`,
  tags: { destructive: true }
})
  .input(z.object({
    pageId: z.string().describe('The ID of the page to delete')
  }))
  .output(z.object({
    deleted: z.boolean().describe('Whether the page was successfully deleted')
  }))
  .handleInvocation(async (ctx) => {
    let client = createClient(ctx.auth, ctx.config);
    await client.deletePage(ctx.input.pageId);

    return {
      output: { deleted: true },
      message: `Deleted page ${ctx.input.pageId} (moved to trash)`
    };
  })
  .build();
