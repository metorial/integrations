import { SlateTool } from 'slates';
import { InstagramClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let commentSchema = z.object({
  commentId: z.string().describe('Comment ID'),
  text: z.string().optional().describe('Comment text'),
  timestamp: z.string().optional().describe('ISO 8601 timestamp'),
  username: z.string().optional().describe('Username of the commenter'),
  likeCount: z.number().optional().describe('Number of likes on the comment'),
  replies: z.array(z.object({
    commentId: z.string().describe('Reply ID'),
    text: z.string().optional().describe('Reply text'),
    timestamp: z.string().optional().describe('ISO 8601 timestamp'),
    username: z.string().optional().describe('Username of the replier'),
  })).optional().describe('Replies to the comment'),
});

export let manageCommentsTool = SlateTool.create(
  spec,
  {
    name: 'Manage Comments',
    key: 'manage_comments',
    description: `Retrieve, reply to, delete, or hide/unhide comments on Instagram media. Also supports enabling or disabling comments on a specific post. Use the \`action\` field to specify what operation to perform.`,
    instructions: [
      'Use action "list" to get all comments on a post.',
      'Use action "reply" to reply to a specific comment.',
      'Use action "delete" to remove a comment.',
      'Use action "hide" / "unhide" to toggle comment visibility.',
      'Use action "enable" / "disable" to toggle commenting on a post.',
    ],
  }
)
  .input(z.object({
    action: z.enum(['list', 'reply', 'delete', 'hide', 'unhide', 'enable', 'disable']).describe('The comment action to perform'),
    mediaId: z.string().optional().describe('Media ID — required for "list", "enable", and "disable" actions'),
    commentId: z.string().optional().describe('Comment ID — required for "reply", "delete", "hide", and "unhide" actions'),
    message: z.string().optional().describe('Reply text — required for "reply" action'),
    limit: z.number().optional().describe('Number of comments to return for "list" action (default: 50)'),
    cursor: z.string().optional().describe('Pagination cursor for "list" action'),
  }))
  .output(z.object({
    comments: z.array(commentSchema).optional().describe('List of comments (for "list" action)'),
    commentId: z.string().optional().describe('ID of the created reply or affected comment'),
    success: z.boolean().describe('Whether the action was successful'),
    nextCursor: z.string().optional().describe('Pagination cursor for next page'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new InstagramClient({
      token: ctx.auth.token,
      apiVersion: ctx.config.apiVersion,
    });

    let { action } = ctx.input;

    if (action === 'list') {
      if (!ctx.input.mediaId) throw new Error('mediaId is required for "list" action');
      let result = await client.getComments(ctx.input.mediaId, {
        limit: ctx.input.limit,
        after: ctx.input.cursor,
      });

      let comments = (result.data || []).map((c: any) => ({
        commentId: c.id,
        text: c.text,
        timestamp: c.timestamp,
        username: c.username,
        likeCount: c.like_count,
        replies: c.replies?.data?.map((r: any) => ({
          commentId: r.id,
          text: r.text,
          timestamp: r.timestamp,
          username: r.username,
        })),
      }));

      return {
        output: {
          comments,
          success: true,
          nextCursor: result.paging?.cursors?.after,
        },
        message: `Retrieved **${comments.length}** comments on media ${ctx.input.mediaId}.`,
      };
    }

    if (action === 'reply') {
      if (!ctx.input.commentId) throw new Error('commentId is required for "reply" action');
      if (!ctx.input.message) throw new Error('message is required for "reply" action');

      let result = await client.replyToComment(ctx.input.commentId, ctx.input.message);
      return {
        output: {
          commentId: result.id,
          success: true,
        },
        message: `Replied to comment ${ctx.input.commentId}.`,
      };
    }

    if (action === 'delete') {
      if (!ctx.input.commentId) throw new Error('commentId is required for "delete" action');
      await client.deleteComment(ctx.input.commentId);
      return {
        output: {
          commentId: ctx.input.commentId,
          success: true,
        },
        message: `Deleted comment ${ctx.input.commentId}.`,
      };
    }

    if (action === 'hide' || action === 'unhide') {
      if (!ctx.input.commentId) throw new Error('commentId is required for "hide"/"unhide" action');
      await client.hideComment(ctx.input.commentId, action === 'hide');
      return {
        output: {
          commentId: ctx.input.commentId,
          success: true,
        },
        message: `${action === 'hide' ? 'Hidden' : 'Unhidden'} comment ${ctx.input.commentId}.`,
      };
    }

    if (action === 'enable' || action === 'disable') {
      if (!ctx.input.mediaId) throw new Error('mediaId is required for "enable"/"disable" action');
      await client.toggleComments(ctx.input.mediaId, action === 'enable');
      return {
        output: {
          success: true,
        },
        message: `Comments ${action === 'enable' ? 'enabled' : 'disabled'} on media ${ctx.input.mediaId}.`,
      };
    }

    throw new Error(`Unknown action: ${action}`);
  }).build();
