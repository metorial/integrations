import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let managePost = SlateTool.create(
  spec,
  {
    name: 'Manage Post',
    key: 'manage_post',
    description: `Update or delete an existing Facebook post. Use \`action\` to specify whether to update the post message or delete the post entirely.
For Page posts, provide \`pageId\` so the correct Page access token is used.`,
    tags: {
      destructive: true,
    },
  }
)
  .input(z.object({
    postId: z.string().describe('ID of the post to manage'),
    pageId: z.string().optional().describe('Page ID if this is a Page post'),
    action: z.enum(['update', 'delete']).describe('Action to perform on the post'),
    message: z.string().optional().describe('New message text (required for update action)'),
  }))
  .output(z.object({
    success: z.boolean().describe('Whether the operation succeeded'),
    postId: z.string().describe('ID of the managed post'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      apiVersion: ctx.config.apiVersion,
    });

    let pageAccessToken: string | undefined;
    if (ctx.input.pageId) {
      pageAccessToken = await client.getPageAccessToken(ctx.input.pageId);
    }

    if (ctx.input.action === 'delete') {
      await client.deletePost(ctx.input.postId, pageAccessToken);
      return {
        output: { success: true, postId: ctx.input.postId },
        message: `Deleted post **${ctx.input.postId}**.`,
      };
    }

    await client.updatePost(ctx.input.postId, { message: ctx.input.message }, pageAccessToken);
    return {
      output: { success: true, postId: ctx.input.postId },
      message: `Updated post **${ctx.input.postId}**.`,
    };
  }).build();
