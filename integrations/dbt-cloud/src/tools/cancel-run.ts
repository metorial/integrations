import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let cancelRunTool = SlateTool.create(
  spec,
  {
    name: 'Cancel Run',
    key: 'cancel_run',
    description: `Cancel a currently queued or in-progress dbt Cloud job run. The run must be in a cancellable state (Queued, Starting, or Running). Returns the updated run status.`,
    tags: {
      destructive: true
    }
  }
)
  .input(z.object({
    runId: z.string().describe('The unique ID of the run to cancel')
  }))
  .output(z.object({
    runId: z.number().describe('Unique run identifier'),
    status: z.number().describe('Updated status code (30=Cancelled)'),
    statusHumanized: z.string().optional().describe('Human-readable status')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      accountId: ctx.config.accountId,
      baseUrl: ctx.config.baseUrl
    });

    let run = await client.cancelRun(ctx.input.runId);

    return {
      output: {
        runId: run.id,
        status: run.status,
        statusHumanized: run.status_humanized
      },
      message: `Run **#${run.id}** has been cancelled. Status: **${run.status_humanized || 'Cancelled'}**.`
    };
  }).build();
