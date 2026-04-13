import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getRunArtifactTool = SlateTool.create(spec, {
  name: 'Get Run Artifact',
  key: 'get_run_artifact',
  description: `Fetch an artifact file from a completed dbt Cloud run. Supports retrieving \`manifest.json\`, \`run_results.json\`, and \`catalog.json\`. These artifacts contain model metadata, execution timing, test results, and catalog information. Optionally target a specific run step.`,
  instructions: [
    'Common artifact paths: "manifest.json", "run_results.json", "catalog.json".',
    'Use the step parameter to get artifacts from a specific step (1-indexed). Defaults to the last step.'
  ],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      runId: z.string().describe('The unique ID of the completed run'),
      path: z
        .string()
        .describe(
          'Artifact file path (e.g., "manifest.json", "run_results.json", "catalog.json")'
        ),
      step: z
        .number()
        .optional()
        .describe(
          'Step index (1-based) to retrieve artifacts from. Defaults to the latest step.'
        )
    })
  )
  .output(
    z.object({
      artifact: z.any().describe('The artifact file contents (JSON)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      accountId: ctx.config.accountId,
      baseUrl: ctx.config.baseUrl
    });

    let artifact = await client.getRunArtifact(
      ctx.input.runId,
      ctx.input.path,
      ctx.input.step
    );

    return {
      output: { artifact },
      message: `Retrieved artifact **${ctx.input.path}** from run #${ctx.input.runId}.`
    };
  })
  .build();
