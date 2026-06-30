import { z } from 'zod';
import {
  branchPullRequestInputs,
  createClient,
  historySchema,
  issueSchema,
  mapHistory,
  mapIssue,
  pageSchema,
  paginationInputs,
  rawRecordSchema,
  readOnlyTool
} from './shared';

export let searchIssuesTool = readOnlyTool({
  name: 'Search Issues',
  key: 'search_issues',
  description:
    'Search SonarQube issues by project, component, branch, pull request, status, severity, type, tags, and text query.'
})
  .input(
    z.object({
      organization: z
        .string()
        .optional()
        .describe('SonarQube Cloud organization key. Defaults to config.organization.'),
      projectKeys: z
        .array(z.string())
        .optional()
        .describe('Project keys to filter issues. Sent as SonarQube projects.'),
      componentKeys: z
        .array(z.string())
        .optional()
        .describe('Component keys to filter issues. Includes matching descendants.'),
      resolved: z.boolean().optional().describe('Filter resolved or unresolved issues.'),
      severities: z
        .array(z.string())
        .optional()
        .describe('Issue severities, for example BLOCKER, CRITICAL, MAJOR, MINOR, INFO.'),
      statuses: z
        .array(z.string())
        .optional()
        .describe('Issue statuses, for example OPEN, CONFIRMED, REOPENED, RESOLVED, CLOSED.'),
      types: z
        .array(z.string())
        .optional()
        .describe('Issue types, for example BUG, VULNERABILITY, or CODE_SMELL.'),
      tags: z.array(z.string()).optional().describe('Issue tags to filter by.'),
      query: z.string().optional().describe('Text query for issues. Sent as SonarQube q.'),
      ...branchPullRequestInputs,
      ...paginationInputs(100, 500)
    })
  )
  .output(
    z.object({
      issues: z.array(issueSchema).describe('Matching SonarQube issues.'),
      page: pageSchema.optional().describe('Pagination details.')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let result = await client.searchIssues(ctx.input);
    let issues = result.items.map(mapIssue);

    return {
      output: {
        issues,
        page: result.page
      },
      message: `Found **${issues.length}** SonarQube issues.`
    };
  })
  .build();

export let getIssueChangelogTool = readOnlyTool({
  name: 'Get Issue Changelog',
  key: 'get_issue_changelog',
  description:
    'Get the changelog for a SonarQube issue, including workflow transitions, comments, assignments, and field changes when returned.'
})
  .input(
    z.object({
      issueKey: z.string().describe('SonarQube issue key.')
    })
  )
  .output(
    z.object({
      issueKey: z.string().describe('Issue key used for the request.'),
      history: z.array(historySchema).describe('Issue history entries.'),
      raw: rawRecordSchema
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx);
    let data = await client.getIssueChangelog(ctx.input.issueKey);
    let history = Array.isArray(data.changelog)
      ? data.changelog
          .filter(
            (item): item is Record<string, unknown> =>
              typeof item === 'object' && item !== null
          )
          .map(mapHistory)
      : [];

    return {
      output: {
        issueKey: ctx.input.issueKey,
        history,
        raw: data
      },
      message: `Retrieved **${history.length}** changelog entries for SonarQube issue **${ctx.input.issueKey}**.`
    };
  })
  .build();
