import { SlateTool } from 'slates';
import { spec } from '../spec';
import { createClient, resolveProjectId } from '../lib/helpers';
import { z } from 'zod';

export let listPipelines = SlateTool.create(spec, {
  name: 'List Pipelines',
  key: 'list_pipelines',
  description: `List CI/CD pipelines for a project. Filter by status, branch/tag ref, SHA, source, or pipeline name. Results are returned in reverse chronological order.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      projectId: z
        .string()
        .optional()
        .describe('Project ID or URL-encoded path. Falls back to config default.'),
      status: z
        .enum([
          'created',
          'waiting_for_resource',
          'preparing',
          'pending',
          'running',
          'success',
          'failed',
          'canceled',
          'skipped',
          'manual',
          'scheduled'
        ])
        .optional()
        .describe('Filter by pipeline status'),
      ref: z.string().optional().describe('Filter by branch or tag name'),
      sha: z.string().optional().describe('Filter by commit SHA'),
      source: z
        .string()
        .optional()
        .describe(
          'Filter by pipeline source (e.g. push, web, trigger, schedule, api, merge_request_event)'
        ),
      name: z.string().optional().describe('Filter by pipeline name'),
      orderBy: z
        .enum(['id', 'status', 'ref', 'updated_at', 'user_id'])
        .optional()
        .describe('Order by field'),
      sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
      perPage: z.number().optional().describe('Number of results per page (max 100)'),
      page: z.number().optional().describe('Page number')
    })
  )
  .output(
    z.object({
      pipelines: z.array(
        z.object({
          pipelineId: z.number(),
          iid: z.number().optional(),
          projectId: z.number().optional(),
          status: z.string(),
          source: z.string().optional(),
          ref: z.string(),
          sha: z.string(),
          webUrl: z.string().optional(),
          createdAt: z.string().optional(),
          updatedAt: z.string().optional(),
          name: z.string().optional().nullable()
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx.auth, ctx.config);
    let projectId = resolveProjectId(ctx.input.projectId, ctx.config.projectId);

    let result = (await client.listPipelines(projectId, {
      status: ctx.input.status,
      ref: ctx.input.ref,
      sha: ctx.input.sha,
      source: ctx.input.source,
      name: ctx.input.name,
      orderBy: ctx.input.orderBy,
      sort: ctx.input.sort,
      perPage: ctx.input.perPage,
      page: ctx.input.page
    })) as any[];

    let pipelines = result.map((p: any) => ({
      pipelineId: p.id,
      iid: p.iid,
      projectId: p.project_id,
      status: p.status,
      source: p.source,
      ref: p.ref,
      sha: p.sha,
      webUrl: p.web_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      name: p.name
    }));

    return {
      output: { pipelines },
      message: `Found **${pipelines.length}** pipeline(s) in project **${projectId}**.`
    };
  })
  .build();
