import { SlateTool } from 'slates';
import { ClickHouseClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let clickpipeSummarySchema = z.object({
  clickpipeId: z.string().describe('Unique ClickPipe identifier'),
  serviceId: z.string().optional(),
  name: z.string().optional().describe('Name of the ClickPipe'),
  state: z.string().optional().describe('Current state (running, paused, stopped)'),
  scaling: z
    .object({
      replicas: z.number().optional(),
      concurrency: z.number().optional(),
      replicaCpuMillicores: z.number().optional(),
      replicaMemoryGb: z.number().optional()
    })
    .optional()
    .describe('Scaling configuration'),
  source: z.record(z.string(), z.any()).optional().describe('Source configuration')
});

export let listClickPipes = SlateTool.create(spec, {
  name: 'List ClickPipes',
  key: 'list_clickpipes',
  description: `List all ClickPipes (data ingestion pipelines) for a service. Shows pipeline names, states, scaling settings, and source configurations.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service to list ClickPipes for')
    })
  )
  .output(
    z.object({
      clickpipes: z.array(clickpipeSummarySchema)
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let pipes = await client.listClickPipes(ctx.input.serviceId);
    let items = Array.isArray(pipes) ? pipes : [];

    return {
      output: {
        clickpipes: items.map((p: any) => ({
          clickpipeId: p.id,
          serviceId: p.serviceId,
          name: p.name,
          state: p.state,
          scaling: p.scaling,
          source: p.source
        }))
      },
      message: `Found **${items.length}** ClickPipes for service ${ctx.input.serviceId}.`
    };
  })
  .build();

export let getClickPipe = SlateTool.create(spec, {
  name: 'Get ClickPipe',
  key: 'get_clickpipe',
  description: `Retrieve detailed information about a specific ClickPipe, including its source configuration, destination, state, and scaling settings.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      clickpipeId: z.string().describe('ID of the ClickPipe')
    })
  )
  .output(
    z.object({
      clickpipeId: z.string(),
      name: z.string().optional(),
      state: z.string().optional(),
      scaling: z.record(z.string(), z.any()).optional(),
      source: z.record(z.string(), z.any()).optional(),
      destination: z.record(z.string(), z.any()).optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let pipe = await client.getClickPipe(ctx.input.serviceId, ctx.input.clickpipeId);

    return {
      output: {
        clickpipeId: pipe.id,
        name: pipe.name,
        state: pipe.state,
        scaling: pipe.scaling,
        source: pipe.source,
        destination: pipe.destination
      },
      message: `ClickPipe **${pipe.name}** is **${pipe.state}**.`
    };
  })
  .build();

export let createClickPipe = SlateTool.create(spec, {
  name: 'Create ClickPipe',
  key: 'create_clickpipe',
  description: `Create a new ClickPipe data ingestion pipeline for a service. ClickPipes support sources like Apache Kafka, Amazon S3, Google Cloud Storage, Amazon Kinesis, PostgreSQL, and MySQL. Provide the source configuration and destination table settings.`
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service to create the ClickPipe for'),
      name: z.string().describe('Name for the new ClickPipe'),
      source: z
        .record(z.string(), z.any())
        .describe('Source configuration (e.g., kafka, s3, kinesis, postgres, mysql)'),
      destination: z
        .record(z.string(), z.any())
        .describe('Destination configuration including database, table, and columns')
    })
  )
  .output(
    z.object({
      clickpipeId: z.string(),
      name: z.string().optional(),
      state: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let result = await client.createClickPipe(ctx.input.serviceId, {
      name: ctx.input.name,
      source: ctx.input.source,
      destination: ctx.input.destination
    });

    return {
      output: {
        clickpipeId: result.id,
        name: result.name,
        state: result.state
      },
      message: `ClickPipe **${result.name}** created successfully.`
    };
  })
  .build();

export let deleteClickPipe = SlateTool.create(spec, {
  name: 'Delete ClickPipe',
  key: 'delete_clickpipe',
  description: `Delete a ClickPipe data ingestion pipeline from a service.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      clickpipeId: z.string().describe('ID of the ClickPipe to delete')
    })
  )
  .output(
    z.object({
      deleted: z.boolean()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    await client.deleteClickPipe(ctx.input.serviceId, ctx.input.clickpipeId);

    return {
      output: { deleted: true },
      message: `ClickPipe **${ctx.input.clickpipeId}** deleted.`
    };
  })
  .build();

export let controlClickPipeState = SlateTool.create(spec, {
  name: 'Control ClickPipe State',
  key: 'control_clickpipe_state',
  description: `Change the state of a ClickPipe. Start, pause, or stop a data ingestion pipeline.`
})
  .input(
    z.object({
      serviceId: z.string().describe('ID of the service'),
      clickpipeId: z.string().describe('ID of the ClickPipe'),
      state: z
        .enum(['running', 'paused', 'stopped'])
        .describe('Desired state for the ClickPipe')
    })
  )
  .output(
    z.object({
      clickpipeId: z.string(),
      state: z.string().optional()
    })
  )
  .handleInvocation(async ctx => {
    let client = new ClickHouseClient({
      token: ctx.auth.token,
      organizationId: ctx.config.organizationId
    });

    let result = await client.updateClickPipeState(
      ctx.input.serviceId,
      ctx.input.clickpipeId,
      ctx.input.state
    );

    return {
      output: {
        clickpipeId: result?.id || ctx.input.clickpipeId,
        state: result?.state || ctx.input.state
      },
      message: `ClickPipe **${ctx.input.clickpipeId}** state changed to **${ctx.input.state}**.`
    };
  })
  .build();
