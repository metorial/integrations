import { SlateTool } from 'slates';
import { RedditClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let submitComment = SlateTool.create(
  spec,
  {
    name: 'Submit Comment',
    key: 'submit_comment',
    description: `Post a comment on a Reddit post or reply to an existing comment.
Pass a post fullname (t3_*) to comment on a post, or a comment fullname (t1_*) to reply to a comment.`,
    tags: {
      destructive: false,
    },
  }
)
  .input(z.object({
    parentId: z.string().describe('Fullname of the parent post (t3_*) or comment (t1_*) to reply to'),
    text: z.string().describe('Comment text (markdown supported)'),
  }))
  .output(z.object({
    commentId: z.string().optional().describe('Fullname of the created comment'),
    parentId: z.string().describe('Fullname of the parent item'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new RedditClient(ctx.auth.token);

    let result = await client.submitComment(ctx.input.parentId, ctx.input.text);

    let commentData = result?.json?.data?.things?.[0]?.data;

    return {
      output: {
        commentId: commentData?.name ?? undefined,
        parentId: ctx.input.parentId,
      },
      message: `Comment posted as a reply to \`${ctx.input.parentId}\`.`,
    };
  })
  .build();
