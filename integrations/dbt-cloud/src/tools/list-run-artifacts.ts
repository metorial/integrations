import { SlateTool } from 'slates';
import { z } from 'zod';
import { Client } from '../lib/client';
import { spec } from '../spec';

export let listRunArtifactsTool = SlateTool.create(spec, {
  name: 'List Run Artifacts',
  key: 'list_run_artifacts',
  description: `List artifact file paths generated for a completed dbt Cloud run. Use this before fetching a specific artifact such as manifest.json, run_results.json, catalog.json, or sources.json.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      runId: z.string().describe('The unique ID of the completed run'),
      step: z
        .number()
        .optional()
        .describe('Step index (1-based) to list artifacts from. Defaults to the latest step.')
    })
  )
  .output(
    z.object({
      runId: z.string().describe('Run the artifacts belong to'),
      artifacts: z.array(z.string()).describe('Available artifact file paths')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      accountId: ctx.config.accountId,
      baseUrl: ctx.config.baseUrl
    });

    let artifacts = await client.listRunArtifacts(ctx.input.runId, ctx.input.step);

    return {
      output: {
        runId: ctx.input.runId,
        artifacts
      },
      message: `Found **${artifacts.length}** artifact(s) for run #${ctx.input.runId}.`
    };
  })
  .build();
