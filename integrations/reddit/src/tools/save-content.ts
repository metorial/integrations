import { SlateTool } from 'slates';
import { RedditClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let saveContent = SlateTool.create(
  spec,
  {
    name: 'Save Content',
    key: 'save_content',
    description: `Save or unsave a post or comment to your Reddit saved items.`,
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    thingId: z.string().describe('Fullname of the post (t3_*) or comment (t1_*) to save or unsave'),
    action: z.enum(['save', 'unsave']).describe('Whether to save or unsave the content'),
    category: z.string().optional().describe('Save category name (Reddit Gold feature)'),
  }))
  .output(z.object({
    success: z.boolean().describe('Whether the action was successful'),
    thingId: z.string().describe('Fullname of the affected item'),
    action: z.string().describe('The action that was performed'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new RedditClient(ctx.auth.token);

    if (ctx.input.action === 'save') {
      await client.save(ctx.input.thingId, ctx.input.category);
    } else {
      await client.unsave(ctx.input.thingId);
    }

    return {
      output: {
        success: true,
        thingId: ctx.input.thingId,
        action: ctx.input.action,
      },
      message: `Successfully ${ctx.input.action}d \`${ctx.input.thingId}\`.`,
    };
  })
  .build();
