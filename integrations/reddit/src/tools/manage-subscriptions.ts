import { SlateTool } from 'slates';
import { RedditClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let manageSubscriptions = SlateTool.create(spec, {
  name: 'Manage Subscriptions',
  key: 'manage_subscriptions',
  description: `Subscribe or unsubscribe from subreddits, or list the authenticated user's current subscriptions and moderated subreddits.`
})
  .input(
    z.object({
      action: z
        .enum(['subscribe', 'unsubscribe', 'list', 'list_moderated'])
        .describe('Action to perform'),
      subredditName: z
        .string()
        .optional()
        .describe('Subreddit name for subscribe/unsubscribe (without r/ prefix)'),
      limit: z
        .number()
        .optional()
        .describe('Maximum number of subreddits to return when listing')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether the action was successful'),
      subreddits: z
        .array(
          z.object({
            subredditId: z.string().describe('Subreddit fullname'),
            displayName: z.string().describe('Subreddit display name'),
            title: z.string().optional().describe('Subreddit title'),
            subscriberCount: z.number().optional().describe('Number of subscribers'),
            url: z.string().optional().describe('Subreddit URL path')
          })
        )
        .optional()
        .describe('List of subreddits (for list actions)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new RedditClient(ctx.auth.token);
    let { action } = ctx.input;

    if (action === 'subscribe') {
      await client.subscribe(ctx.input.subredditName!);
      return {
        output: { success: true },
        message: `Subscribed to r/${ctx.input.subredditName}.`
      };
    }

    if (action === 'unsubscribe') {
      await client.unsubscribe(ctx.input.subredditName!);
      return {
        output: { success: true },
        message: `Unsubscribed from r/${ctx.input.subredditName}.`
      };
    }

    let data: any;
    if (action === 'list_moderated') {
      data = await client.getMyModeratedSubreddits({ limit: ctx.input.limit ?? 100 });
    } else {
      data = await client.getMySubreddits({ limit: ctx.input.limit ?? 100 });
    }

    let children = data?.data?.children ?? [];
    let subreddits = children.map((c: any) => {
      let d = c.data;
      return {
        subredditId: d.name,
        displayName: d.display_name,
        title: d.title,
        subscriberCount: d.subscribers,
        url: d.url
      };
    });

    return {
      output: {
        success: true,
        subreddits
      },
      message: `Found ${subreddits.length} ${action === 'list_moderated' ? 'moderated' : 'subscribed'} subreddits.`
    };
  })
  .build();
