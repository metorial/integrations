import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getAgentStatusTool = SlateTool.create(spec, {
  name: 'Get Agent Status',
  key: 'get_agent_status',
  description: `Check the status of an agent job and retrieve the gathered data when complete.`,
  instructions: ['Provide the agentId returned by the Run Agent tool.'],
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      agentId: z.string().describe('The ID of the agent job to check')
    })
  )
  .output(
    z.object({
      status: z.string().describe('Current status of the agent job'),
      extractedData: z
        .any()
        .optional()
        .describe('Data gathered by the agent (available when completed)'),
      expiresAt: z.string().optional().describe('When the results expire')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.getAgentStatus(ctx.input.agentId);

    return {
      output: {
        status: result.status,
        extractedData: result.data,
        expiresAt: result.expiresAt
      },
      message: `Agent job \`${ctx.input.agentId}\` is **${result.status}**.`
    };
  });
