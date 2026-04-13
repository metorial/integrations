import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let managePipelines = SlateTool.create(spec, {
  name: 'Manage Pipelines',
  key: 'manage_pipelines',
  description: `Manage Heroku Pipelines for continuous delivery workflows. List, create, update, or delete pipelines, and manage pipeline couplings that link apps to pipeline stages (development, staging, production).`,
  instructions: [
    'Use "list_couplings" to see which apps are in each stage of a pipeline.',
    'Use "add_app" to couple an app to a pipeline stage.',
    'Use "remove_app" to decouple an app from a pipeline.'
  ]
})
  .input(
    z.object({
      action: z
        .enum([
          'list',
          'get',
          'create',
          'update',
          'delete',
          'list_couplings',
          'add_app',
          'remove_app'
        ])
        .describe('Operation to perform'),
      pipelineIdOrName: z.string().optional().describe('Pipeline ID or name'),
      name: z.string().optional().describe('Pipeline name (for create/update)'),
      appIdOrName: z.string().optional().describe('App ID or name (for add_app)'),
      stage: z
        .string()
        .optional()
        .describe('Pipeline stage: "development", "staging", "production" (for add_app)'),
      couplingId: z.string().optional().describe('Pipeline coupling ID (for remove_app)')
    })
  )
  .output(
    z.object({
      pipelines: z
        .array(
          z.object({
            pipelineId: z.string().describe('Unique identifier of the pipeline'),
            name: z.string().describe('Name of the pipeline'),
            createdAt: z.string().describe('When the pipeline was created'),
            updatedAt: z.string().describe('When the pipeline was last updated')
          })
        )
        .optional(),
      couplings: z
        .array(
          z.object({
            couplingId: z.string().describe('Unique identifier of the coupling'),
            pipelineId: z.string().describe('Pipeline ID'),
            appId: z.string().describe('App ID'),
            appName: z.string().describe('App name'),
            stage: z.string().describe('Pipeline stage')
          })
        )
        .optional(),
      deleted: z.boolean().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });
    let { action } = ctx.input;

    let mapPipeline = (p: any) => ({
      pipelineId: p.pipelineId,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    });

    let mapCoupling = (c: any) => ({
      couplingId: c.couplingId,
      pipelineId: c.pipelineId,
      appId: c.appId,
      appName: c.appName,
      stage: c.stage
    });

    if (action === 'list') {
      let pipelines = await client.listPipelines();
      return {
        output: { pipelines: pipelines.map(mapPipeline) },
        message: `Found **${pipelines.length}** pipeline(s).`
      };
    }

    if (action === 'get') {
      if (!ctx.input.pipelineIdOrName) throw new Error('pipelineIdOrName is required.');
      let pipeline = await client.getPipeline(ctx.input.pipelineIdOrName);
      return {
        output: { pipelines: [mapPipeline(pipeline)] },
        message: `Retrieved pipeline **${pipeline.name}**.`
      };
    }

    if (action === 'create') {
      if (!ctx.input.name) throw new Error('name is required for "create" action.');
      let pipeline = await client.createPipeline({ name: ctx.input.name });
      return {
        output: { pipelines: [mapPipeline(pipeline)] },
        message: `Created pipeline **${pipeline.name}**.`
      };
    }

    if (action === 'update') {
      if (!ctx.input.pipelineIdOrName) throw new Error('pipelineIdOrName is required.');
      let pipeline = await client.updatePipeline(ctx.input.pipelineIdOrName, {
        name: ctx.input.name
      });
      return {
        output: { pipelines: [mapPipeline(pipeline)] },
        message: `Updated pipeline **${pipeline.name}**.`
      };
    }

    if (action === 'delete') {
      if (!ctx.input.pipelineIdOrName) throw new Error('pipelineIdOrName is required.');
      await client.deletePipeline(ctx.input.pipelineIdOrName);
      return {
        output: { deleted: true },
        message: `Deleted pipeline **${ctx.input.pipelineIdOrName}**.`
      };
    }

    if (action === 'list_couplings') {
      if (!ctx.input.pipelineIdOrName) throw new Error('pipelineIdOrName is required.');
      let couplings = await client.listPipelineCouplings(ctx.input.pipelineIdOrName);
      return {
        output: { couplings: couplings.map(mapCoupling) },
        message: `Found **${couplings.length}** app(s) in pipeline.`
      };
    }

    if (action === 'add_app') {
      if (!ctx.input.pipelineIdOrName) throw new Error('pipelineIdOrName is required.');
      if (!ctx.input.appIdOrName) throw new Error('appIdOrName is required.');
      if (!ctx.input.stage) throw new Error('stage is required.');
      let coupling = await client.createPipelineCoupling({
        pipelineId: ctx.input.pipelineIdOrName,
        appIdOrName: ctx.input.appIdOrName,
        stage: ctx.input.stage
      });
      return {
        output: { couplings: [mapCoupling(coupling)] },
        message: `Added app **${coupling.appName}** to pipeline stage **${coupling.stage}**.`
      };
    }

    // remove_app
    if (!ctx.input.couplingId)
      throw new Error('couplingId is required for "remove_app" action.');
    await client.deletePipelineCoupling(ctx.input.couplingId);
    return {
      output: { deleted: true },
      message: `Removed app from pipeline.`
    };
  })
  .build();
