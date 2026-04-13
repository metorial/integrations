import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let searchCodeTool = SlateTool.create(
  spec,
  {
    name: 'Search Code',
    key: 'search_code',
    description: `Search for code across repositories in the workspace. Returns matching file paths and code snippets.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    searchQuery: z.string().describe('Search query string'),
    page: z.number().optional().describe('Page number'),
    pageLen: z.number().optional().describe('Results per page'),
  }))
  .output(z.object({
    results: z.array(z.object({
      repoSlug: z.string().optional(),
      repoFullName: z.string().optional(),
      filePath: z.string().optional(),
      matchingLines: z.array(z.object({
        line: z.number().optional(),
        text: z.string().optional(),
      })).optional(),
    })),
    totalCount: z.number().optional(),
    hasNextPage: z.boolean(),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token, workspace: ctx.config.workspace });

    // search code is workspace-scoped, but we pass an empty repoSlug since the API endpoint is /workspaces/{workspace}/search/code
    let result = await client.searchCode('', ctx.input.searchQuery, {
      page: ctx.input.page,
      pageLen: ctx.input.pageLen,
    });

    let results = (result.values || []).map((r: any) => ({
      repoSlug: r.file?.links?.self?.href?.match(/repositories\/[^/]+\/([^/]+)/)?.[1] || undefined,
      repoFullName: r.file?.links?.self?.href?.match(/repositories\/([^/]+\/[^/]+)/)?.[1] || undefined,
      filePath: r.file?.path || undefined,
      matchingLines: (r.content_matches || []).flatMap((cm: any) =>
        (cm.lines || []).map((l: any) => ({
          line: l.line,
          text: l.segments?.map((s: any) => s.text).join('') || undefined,
        }))
      ),
    }));

    return {
      output: {
        results,
        totalCount: result.size,
        hasNextPage: !!result.next,
      },
      message: `Found **${results.length}** code search results for "${ctx.input.searchQuery}".`,
    };
  }).build();
