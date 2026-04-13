import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let getIssueTool = SlateTool.create(spec, {
  name: 'Get Issue Details',
  key: 'get_issue',
  description: `Retrieve detailed information about a specific Sentry issue, including its latest event with stack trace, tags, and contextual data. Optionally fetches comments and tag breakdowns.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      issueId: z.string().describe('The issue ID to retrieve'),
      includeLatestEvent: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to include the latest event with stack trace'),
      includeTags: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to include tag breakdowns')
    })
  )
  .output(
    z.object({
      issueId: z.string(),
      shortId: z.string(),
      title: z.string(),
      culprit: z.string().optional(),
      level: z.string(),
      status: z.string(),
      substatus: z.string().optional(),
      platform: z.string().optional(),
      projectSlug: z.string().optional(),
      projectName: z.string().optional(),
      count: z.string().optional(),
      userCount: z.number().optional(),
      firstSeen: z.string().optional(),
      lastSeen: z.string().optional(),
      assignedTo: z.any().optional(),
      isPublic: z.boolean().optional(),
      isBookmarked: z.boolean().optional(),
      permalink: z.string().optional(),
      metadata: z.any().optional().describe('Issue metadata including type, value, filename'),
      latestEvent: z
        .any()
        .optional()
        .describe('Latest event data including stack trace and context'),
      tags: z.array(z.any()).optional().describe('Tag breakdowns for the issue')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);

    let issue = await client.getIssue(ctx.input.issueId);

    let latestEvent: any = undefined;
    if (ctx.input.includeLatestEvent) {
      try {
        latestEvent = await client.getLatestEvent(ctx.input.issueId);
      } catch {
        // Latest event may not be available
      }
    }

    let tags: any[] | undefined = undefined;
    if (ctx.input.includeTags) {
      try {
        tags = await client.listIssueTags(ctx.input.issueId);
      } catch {
        // Tags may not be available
      }
    }

    return {
      output: {
        issueId: String(issue.id),
        shortId: issue.shortId || '',
        title: issue.title || '',
        culprit: issue.culprit,
        level: issue.level,
        status: issue.status,
        substatus: issue.substatus,
        platform: issue.platform,
        projectSlug: issue.project?.slug,
        projectName: issue.project?.name,
        count: issue.count,
        userCount: issue.userCount,
        firstSeen: issue.firstSeen,
        lastSeen: issue.lastSeen,
        assignedTo: issue.assignedTo,
        isPublic: issue.isPublic,
        isBookmarked: issue.isBookmarked,
        permalink: issue.permalink,
        metadata: issue.metadata,
        latestEvent,
        tags
      },
      message: `Retrieved issue **${issue.shortId}**: ${issue.title} (${issue.status}).`
    };
  })
  .build();
