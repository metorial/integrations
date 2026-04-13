import { SlateTool } from 'slates';
import { GitLabClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listPipelines = SlateTool.create(
  spec,
  {
    name: 'List Pipelines',
    key: 'list_pipelines',
    description: `List CI/CD pipelines for a project. Filter by status, ref (branch/tag), SHA, or source. Useful for monitoring build and deployment status.`,
    tags: {
      destructive: false,
      readOnly: true
    }
  }
)
  .input(z.object({
    projectId: z.string().describe('Project ID or URL-encoded path'),
    status: z.enum(['created', 'waiting_for_resource', 'preparing', 'pending', 'running', 'success', 'failed', 'canceled', 'skipped', 'manual', 'scheduled']).optional().describe('Filter by pipeline status'),
    ref: z.string().optional().describe('Filter by branch or tag name'),
    sha: z.string().optional().describe('Filter by commit SHA'),
    source: z.string().optional().describe('Filter by pipeline source (push, web, trigger, schedule, etc.)'),
    orderBy: z.enum(['id', 'status', 'ref', 'updated_at', 'user_id']).optional().describe('Order by field'),
    sort: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    perPage: z.number().optional().describe('Results per page (max 100)'),
    page: z.number().optional().describe('Page number')
  }))
  .output(z.object({
    pipelines: z.array(z.object({
      pipelineId: z.number().describe('Pipeline ID'),
      pipelineIid: z.number().nullable().describe('Pipeline IID'),
      status: z.string().describe('Pipeline status'),
      ref: z.string().describe('Branch/tag'),
      sha: z.string().describe('Commit SHA'),
      webUrl: z.string().describe('URL to the pipeline'),
      source: z.string().nullable().describe('Pipeline source'),
      createdAt: z.string().describe('Creation timestamp'),
      updatedAt: z.string().describe('Last update timestamp')
    })),
    totalPages: z.number().describe('Total pages')
  }))
  .handleInvocation(async (ctx) => {
    let client = new GitLabClient({
      token: ctx.auth.token,
      instanceUrl: ctx.auth.instanceUrl || ctx.config.instanceUrl
    });

    let result = await client.listPipelines(ctx.input.projectId, {
      status: ctx.input.status,
      ref: ctx.input.ref,
      sha: ctx.input.sha,
      source: ctx.input.source,
      orderBy: ctx.input.orderBy,
      sort: ctx.input.sort,
      perPage: ctx.input.perPage,
      page: ctx.input.page
    });

    let pipelines = result.pipelines.map((p: any) => ({
      pipelineId: p.id,
      pipelineIid: p.iid || null,
      status: p.status,
      ref: p.ref,
      sha: p.sha,
      webUrl: p.web_url,
      source: p.source || null,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    return {
      output: { pipelines, totalPages: result.totalPages },
      message: `Found **${pipelines.length}** pipelines${ctx.input.status ? ` with status "${ctx.input.status}"` : ''}`
    };
  })
  .build();
