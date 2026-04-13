import { SlateTool } from 'slates';
import { TwitterClient } from '../lib/client';
import { postSchema, mapPost } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let createPost = SlateTool.create(spec, {
  name: 'Create Post',
  key: 'create_post',
  description: `Create a new post (tweet) on Twitter/X. Supports plain text posts, replies to existing posts, quote posts, posts with media attachments, and polls.`,
  instructions: [
    'Text is limited to 280 characters.',
    'To reply to a post, provide the replyToPostId.',
    'To quote a post, provide the quotePostId.',
    'Media must be uploaded separately first—provide media IDs from a prior upload.',
    'Polls require 2-4 options and a duration in minutes (default 1440 = 24 hours).'
  ],
  constraints: [
    'Maximum 280 characters per post.',
    'Polls and media cannot be combined in the same post.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      text: z.string().describe('Text content of the post (max 280 characters)'),
      replyToPostId: z.string().optional().describe('Post ID to reply to, creating a thread'),
      quotePostId: z.string().optional().describe('Post ID to quote'),
      mediaIds: z
        .array(z.string())
        .optional()
        .describe('Array of media IDs to attach (uploaded separately)'),
      pollOptions: z.array(z.string()).optional().describe('Poll options (2-4 choices)'),
      pollDurationMinutes: z
        .number()
        .optional()
        .describe('Poll duration in minutes (default 1440)')
    })
  )
  .output(
    z.object({
      post: postSchema.describe('The created post')
    })
  )
  .handleInvocation(async ctx => {
    let client = new TwitterClient(ctx.auth.token);

    let result = await client.createPost({
      text: ctx.input.text,
      replyToPostId: ctx.input.replyToPostId,
      quotePostId: ctx.input.quotePostId,
      mediaIds: ctx.input.mediaIds,
      pollOptions: ctx.input.pollOptions,
      pollDurationMinutes: ctx.input.pollDurationMinutes
    });

    let post = mapPost(result.data);

    return {
      output: { post },
      message: `Created post: "${ctx.input.text.substring(0, 50)}${ctx.input.text.length > 50 ? '...' : ''}"`
    };
  })
  .build();
