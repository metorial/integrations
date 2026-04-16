import { defineSlateToolE2EIntegration, runSlateToolE2ESuite } from '@slates/test';
import { z } from 'zod';
import { LinearClient } from './lib/client';
import { provider } from './index';

let wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export let linearToolE2E = defineSlateToolE2EIntegration<
  {
    teamId: string;
  },
  {
    client: LinearClient;
  }
>({
  fixturesSchema: z.object({
    teamId: z.string()
  }),
  createHelpers: ctx => ({
    client: new LinearClient(ctx.auth.token)
  }),
  resources: {
    team: {
      fromFixture: ctx => ({
        teamId: ctx.fixtures.teamId
      })
    },
    issue: {
      use: ['team']
    },
    project: {
      use: ['team'],
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.projectId === 'string') {
            await ctx.helpers.client.deleteProject(value.projectId);
          }
        }
      }
    },
    comment: {
      use: ['issue']
    },
    cycle: {
      use: ['team'],
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.cycleId === 'string') {
            await ctx.helpers.client.deleteCycle(value.cycleId);
          }
        }
      }
    },
    label: {
      use: ['team'],
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.labelId === 'string') {
            await ctx.helpers.client.deleteLabel(value.labelId);
          }
        }
      }
    },
    document: {
      use: ['project'],
      cleanup: {
        kind: 'delete',
        run: async (ctx, value) => {
          if (typeof value.documentId === 'string') {
            await ctx.helpers.client.deleteDocument(value.documentId);
          }
        }
      }
    }
  },
  scenarioOverrides: {
    search_issues: {
      name: 'search_issues finds the created issue',
      use: ['issue'],
      run: async ctx => {
        let issue = ctx.resource('issue');
        let issueId = issue.issueId;
        let query = String(issue.title ?? ctx.runId);

        for (let attempt = 0; attempt < 5; attempt += 1) {
          let result = await ctx.invokeTool('search_issues', {
            query,
            teamId: ctx.resource('team').teamId,
            first: 25,
            includeArchived: true
          });

          if (
            typeof issueId === 'string' &&
            result.output.issues.some((candidate: { issueId?: string }) => candidate.issueId === issueId)
          ) {
            return;
          }

          await wait(1000 * (attempt + 1));
        }

        throw new Error(`search_issues did not return the expected issue for query "${query}".`);
      }
    }
  }
});

runSlateToolE2ESuite({
  provider,
  integration: linearToolE2E
});
