import { SlateTool } from 'slates';
import { GitLabClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let managePipeline = SlateTool.create(spec, {
  name: 'Manage Pipeline',
  key: 'manage_pipeline',
  description: `Trigger, retry, or cancel a CI/CD pipeline. Use "create" to trigger a new pipeline on a given ref (branch/tag). Use "retry" or "cancel" to manage an existing pipeline by its ID. Optionally pass CI/CD variables when triggering.`,
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      action: z
        .enum(['create', 'retry', 'cancel'])
        .describe('Operation: create a new pipeline, or retry/cancel an existing one'),
      projectId: z.string().describe('Project ID or URL-encoded path'),
      pipelineId: z.number().optional().describe('Pipeline ID (required for retry/cancel)'),
      ref: z
        .string()
        .optional()
        .describe('Branch or tag name to run the pipeline on (required for create)'),
      variables: z
        .array(
          z.object({
            key: z.string().describe('Variable key'),
            value: z.string().describe('Variable value'),
            variableType: z.enum(['env_var', 'file']).optional().describe('Variable type')
          })
        )
        .optional()
        .describe('CI/CD variables to pass when triggering (create only)')
    })
  )
  .output(
    z.object({
      pipelineId: z.number().describe('Pipeline ID'),
      pipelineIid: z.number().nullable().describe('Pipeline IID within project'),
      status: z.string().describe('Pipeline status'),
      ref: z.string().describe('Branch/tag the pipeline ran on'),
      sha: z.string().describe('Commit SHA'),
      webUrl: z.string().describe('URL to the pipeline'),
      source: z.string().nullable().describe('Pipeline source (push, web, trigger, etc.)'),
      createdAt: z.string().describe('Creation timestamp')
    })
  )
  .handleInvocation(async ctx => {
    let client = new GitLabClient({
      token: ctx.auth.token,
      instanceUrl: ctx.auth.instanceUrl || ctx.config.instanceUrl
    });

    let pipeline: any;

    switch (ctx.input.action) {
      case 'create': {
        if (!ctx.input.ref)
          throw new Error('Ref (branch/tag) is required to create a pipeline');
        pipeline = await client.createPipeline(
          ctx.input.projectId,
          ctx.input.ref,
          ctx.input.variables
        );
        break;
      }
      case 'retry': {
        if (!ctx.input.pipelineId) throw new Error('Pipeline ID is required for retry');
        pipeline = await client.retryPipeline(ctx.input.projectId, ctx.input.pipelineId);
        break;
      }
      case 'cancel': {
        if (!ctx.input.pipelineId) throw new Error('Pipeline ID is required for cancel');
        pipeline = await client.cancelPipeline(ctx.input.projectId, ctx.input.pipelineId);
        break;
      }
    }

    let actionVerb = { create: 'Triggered', retry: 'Retried', cancel: 'Cancelled' }[
      ctx.input.action
    ];

    return {
      output: {
        pipelineId: pipeline.id,
        pipelineIid: pipeline.iid || null,
        status: pipeline.status,
        ref: pipeline.ref,
        sha: pipeline.sha,
        webUrl: pipeline.web_url,
        source: pipeline.source || null,
        createdAt: pipeline.created_at
      },
      message: `${actionVerb} pipeline **#${pipeline.id}** on \`${pipeline.ref}\` — status: **${pipeline.status}**`
    };
  })
  .build();
