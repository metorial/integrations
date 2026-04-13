import { SlateTool } from 'slates';
import { RedditClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let submitPost = SlateTool.create(spec, {
  name: 'Submit Post',
  key: 'submit_post',
  description: `Submit a new post to a subreddit. Supports both text (self) posts and link posts.
Optionally set flair, mark as NSFW or spoiler, and control inbox reply notifications.`,
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      subredditName: z
        .string()
        .describe('Name of the subreddit to post to (without r/ prefix)'),
      title: z.string().describe('Title of the post'),
      postType: z.enum(['text', 'link']).describe('Type of post to submit'),
      text: z.string().optional().describe('Body text for text posts (markdown supported)'),
      linkUrl: z.string().optional().describe('URL for link posts'),
      flairId: z.string().optional().describe('Flair template ID to apply'),
      flairText: z.string().optional().describe('Custom flair text'),
      isNsfw: z.boolean().optional().describe('Mark the post as NSFW'),
      isSpoiler: z.boolean().optional().describe('Mark the post as a spoiler'),
      sendReplies: z
        .boolean()
        .optional()
        .describe('Send inbox notifications for comments on this post')
    })
  )
  .output(
    z.object({
      postId: z.string().optional().describe('Fullname of the created post'),
      postUrl: z.string().optional().describe('URL of the created post')
    })
  )
  .handleInvocation(async ctx => {
    let client = new RedditClient(ctx.auth.token);

    let result: any;
    if (ctx.input.postType === 'link') {
      result = await client.submitLinkPost({
        subreddit: ctx.input.subredditName,
        title: ctx.input.title,
        url: ctx.input.linkUrl!,
        flairId: ctx.input.flairId,
        flairText: ctx.input.flairText,
        nsfw: ctx.input.isNsfw,
        spoiler: ctx.input.isSpoiler,
        sendreplies: ctx.input.sendReplies
      });
    } else {
      result = await client.submitTextPost({
        subreddit: ctx.input.subredditName,
        title: ctx.input.title,
        text: ctx.input.text ?? '',
        flairId: ctx.input.flairId,
        flairText: ctx.input.flairText,
        nsfw: ctx.input.isNsfw,
        spoiler: ctx.input.isSpoiler,
        sendreplies: ctx.input.sendReplies
      });
    }

    let postData = result?.json?.data;

    return {
      output: {
        postId: postData?.name ?? postData?.id,
        postUrl: postData?.url
      },
      message: `Submitted ${ctx.input.postType} post "${ctx.input.title}" to r/${ctx.input.subredditName}.${postData?.url ? ` [View post](${postData.url})` : ''}`
    };
  })
  .build();
