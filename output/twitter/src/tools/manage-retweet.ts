import { SlateTool } from 'slates';
import { TwitterClient } from '../lib/client';
import { userSchema, mapUser } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let manageRetweet = SlateTool.create(
  spec,
  {
    name: 'Manage Retweet',
    key: 'manage_retweet',
    description: `Retweet or undo a retweet of a post, or retrieve users who retweeted a specific post.`,
    instructions: [
      'Use action **retweet** or **undo_retweet** to retweet/undo retweet (requires userId and postId).',
      'Use action **list_retweeted_by** to get users who retweeted a specific post.'
    ],
    tags: {
      destructive: false,
      readOnly: false
    }
  }
)
  .input(z.object({
    action: z.enum(['retweet', 'undo_retweet', 'list_retweeted_by']).describe('Action to perform'),
    userId: z.string().optional().describe('User ID (required for retweet, undo_retweet)'),
    postId: z.string().describe('Post ID to act on'),
    maxResults: z.number().optional().describe('Number of results for list action'),
    paginationToken: z.string().optional().describe('Pagination token for list action')
  }))
  .output(z.object({
    success: z.boolean().optional().describe('Whether the action was successful'),
    users: z.array(userSchema).optional().describe('Users who retweeted (for list_retweeted_by)'),
    nextToken: z.string().optional().describe('Pagination token for next page')
  }))
  .handleInvocation(async (ctx) => {
    let client = new TwitterClient(ctx.auth.token);
    let { action, userId, postId, maxResults, paginationToken } = ctx.input;

    if (action === 'retweet') {
      if (!userId) throw new Error('userId is required to retweet.');
      await client.retweet(userId, postId);
      return {
        output: { success: true },
        message: `Retweeted post ${postId}.`
      };
    }

    if (action === 'undo_retweet') {
      if (!userId) throw new Error('userId is required to undo retweet.');
      await client.undoRetweet(userId, postId);
      return {
        output: { success: true },
        message: `Undid retweet of post ${postId}.`
      };
    }

    if (action === 'list_retweeted_by') {
      let result = await client.getRetweetedByUsers(postId, { maxResults, paginationToken });
      let users = (result.data || []).map(mapUser);
      return {
        output: { users, nextToken: result.meta?.next_token },
        message: `Retrieved **${users.length}** user(s) who retweeted the post.`
      };
    }

    throw new Error('Invalid action.');
  }).build();
