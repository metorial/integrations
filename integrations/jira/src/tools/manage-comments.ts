import { SlateTool } from 'slates';
import { JiraClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let addCommentTool = SlateTool.create(spec, {
  name: 'Add Comment',
  key: 'add_comment',
  description: `Add a comment to a Jira issue. Supports plain text or Atlassian Document Format (ADF) for rich text comments.`,
  tags: {
    readOnly: false
  }
})
  .input(
    z.object({
      issueIdOrKey: z.string().describe('The issue key or ID to comment on.'),
      body: z.any().describe('Comment body as a plain text string or ADF object.')
    })
  )
  .output(
    z.object({
      commentId: z.string().describe('The ID of the created comment.'),
      issueIdOrKey: z.string().describe('The issue key or ID.'),
      authorDisplayName: z.string().optional().describe('Display name of the comment author.'),
      created: z.string().optional().describe('Creation timestamp.')
    })
  )
  .handleInvocation(async ctx => {
    let client = new JiraClient({
      token: ctx.auth.token,
      cloudId: ctx.config.cloudId,
      refreshToken: ctx.auth.refreshToken
    });

    let body = ctx.input.body;
    if (typeof body === 'string') {
      body = {
        version: 1,
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: body }] }]
      };
    }

    let comment = await client.addComment(ctx.input.issueIdOrKey, body);

    return {
      output: {
        commentId: comment.id,
        issueIdOrKey: ctx.input.issueIdOrKey,
        authorDisplayName: comment.author?.displayName,
        created: comment.created
      },
      message: `Added comment to **${ctx.input.issueIdOrKey}**.`
    };
  })
  .build();

export let listCommentsTool = SlateTool.create(spec, {
  name: 'List Comments',
  key: 'list_comments',
  description: `List comments on a Jira issue with pagination support.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      issueIdOrKey: z.string().describe('The issue key or ID.'),
      startAt: z.number().optional().default(0).describe('Pagination start index.'),
      maxResults: z.number().optional().default(50).describe('Maximum comments to return.')
    })
  )
  .output(
    z.object({
      total: z.number().describe('Total number of comments.'),
      comments: z.array(
        z.object({
          commentId: z.string().describe('The comment ID.'),
          authorDisplayName: z.string().optional().describe('Author display name.'),
          authorAccountId: z.string().optional().describe('Author account ID.'),
          body: z.any().describe('Comment body in ADF format.'),
          created: z.string().optional().describe('Creation timestamp.'),
          updated: z.string().optional().describe('Last updated timestamp.')
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new JiraClient({
      token: ctx.auth.token,
      cloudId: ctx.config.cloudId,
      refreshToken: ctx.auth.refreshToken
    });

    let result = await client.getComments(ctx.input.issueIdOrKey, {
      startAt: ctx.input.startAt,
      maxResults: ctx.input.maxResults
    });

    let comments = (result.comments ?? []).map((c: any) => ({
      commentId: c.id,
      authorDisplayName: c.author?.displayName,
      authorAccountId: c.author?.accountId,
      body: c.body,
      created: c.created,
      updated: c.updated
    }));

    return {
      output: {
        total: result.total,
        comments
      },
      message: `Found **${result.total}** comments on **${ctx.input.issueIdOrKey}**. Returned ${comments.length}.`
    };
  })
  .build();
