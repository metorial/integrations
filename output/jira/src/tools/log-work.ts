import { SlateTool } from 'slates';
import { JiraClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let logWorkTool = SlateTool.create(
  spec,
  {
    name: 'Log Work',
    key: 'log_work',
    description: `Log time spent on a Jira issue. Provide time as a human-readable string (e.g., "2h 30m") or in seconds. Optionally include a start timestamp and comment.`,
    tags: {
      readOnly: false,
    },
  }
)
  .input(z.object({
    issueIdOrKey: z.string().describe('The issue key or ID to log work on.'),
    timeSpent: z.string().optional().describe('Time spent in Jira format (e.g., "2h 30m", "1d", "45m").'),
    timeSpentSeconds: z.number().optional().describe('Time spent in seconds (alternative to timeSpent).'),
    started: z.string().optional().describe('When the work started in ISO 8601 format (e.g., "2024-01-15T09:00:00.000+0000"). Defaults to now.'),
    comment: z.string().optional().describe('Optional worklog comment.'),
  }))
  .output(z.object({
    worklogId: z.string().describe('The ID of the created worklog.'),
    issueIdOrKey: z.string().describe('The issue key or ID.'),
    timeSpent: z.string().optional().describe('The time spent as formatted by Jira.'),
    timeSpentSeconds: z.number().optional().describe('The time spent in seconds.'),
    authorDisplayName: z.string().optional().describe('The worklog author display name.'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new JiraClient({
      token: ctx.auth.token,
      cloudId: ctx.config.cloudId,
      refreshToken: ctx.auth.refreshToken,
    });

    let worklog: Record<string, any> = {};

    if (ctx.input.timeSpent) {
      worklog.timeSpent = ctx.input.timeSpent;
    }
    if (ctx.input.timeSpentSeconds) {
      worklog.timeSpentSeconds = ctx.input.timeSpentSeconds;
    }
    if (ctx.input.started) {
      worklog.started = ctx.input.started;
    }
    if (ctx.input.comment) {
      worklog.comment = {
        version: 1,
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: ctx.input.comment }] }],
      };
    }

    let result = await client.addWorklog(ctx.input.issueIdOrKey, worklog);

    return {
      output: {
        worklogId: result.id,
        issueIdOrKey: ctx.input.issueIdOrKey,
        timeSpent: result.timeSpent,
        timeSpentSeconds: result.timeSpentSeconds,
        authorDisplayName: result.author?.displayName,
      },
      message: `Logged **${result.timeSpent ?? ctx.input.timeSpent}** on **${ctx.input.issueIdOrKey}**.`,
    };
  })
  .build();
