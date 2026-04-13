import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let createZap = SlateTool.create(spec, {
  name: 'Create Zap',
  key: 'create_zap',
  description: `Create a new Zap (automated workflow) with a specified title and steps. Each step requires an action ID, authentication ID, and input field values.
Use the **List Actions** and **List Authentications** tools first to get valid action and authentication IDs, and **Get Action Input Fields** to discover required inputs for each step.`,
  instructions: [
    'Each step must have an action ID from the /v2/actions endpoint, an authentication ID from /v2/authentications, and the required input fields.',
    'The first step should be a trigger (READ type action), and subsequent steps should be actions (WRITE type).',
    'Use step aliases (snake_case, max 64 chars) to reference output from earlier steps in later step inputs.'
  ],
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      title: z.string().describe('Title for the new Zap'),
      steps: z
        .array(
          z.object({
            actionId: z.string().describe('Action ID from the /v2/actions endpoint'),
            authenticationId: z
              .string()
              .nullable()
              .describe('Authentication ID from /v2/authentications, or null'),
            inputs: z.record(z.string(), z.any()).describe('Input field values for this step'),
            alias: z
              .string()
              .nullable()
              .optional()
              .describe('Optional alias for referencing this step (snake_case, max 64 chars)')
          })
        )
        .min(1)
        .describe('Ordered list of workflow steps')
    })
  )
  .output(
    z.object({
      zapId: z.string().describe('Unique identifier for the created Zap'),
      title: z.string().describe('Zap title'),
      isEnabled: z.boolean().describe('Whether the Zap is enabled'),
      editorUrl: z.string().describe('URL to edit the Zap in Zapier'),
      steps: z.array(
        z.object({
          action: z.any().describe('Action details'),
          authentication: z.any().nullable().describe('Authentication details'),
          inputs: z.record(z.string(), z.any()).describe('Step input field values'),
          title: z.string().nullable().describe('Step title')
        })
      )
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let steps = ctx.input.steps.map(step => ({
      action: step.actionId,
      inputs: step.inputs,
      authentication: step.authenticationId,
      alias: step.alias
    }));

    let response = await client.createZap(
      {
        title: ctx.input.title,
        steps
      },
      'steps.action'
    );

    return {
      output: {
        zapId: response.id,
        title: response.title,
        isEnabled: response.isEnabled,
        editorUrl: response.links?.htmlEditor || '',
        steps: response.steps || []
      },
      message: `Created Zap **"${response.title}"** (ID: \`${response.id}\`) with ${(response.steps || []).length} step(s). The Zap is currently ${response.isEnabled ? 'enabled' : 'disabled'}.`
    };
  })
  .build();
