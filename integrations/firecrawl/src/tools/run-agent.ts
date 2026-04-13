import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let runAgentTool = SlateTool.create(
  spec,
  {
    name: 'Run Agent',
    key: 'run_agent',
    description: `Launch an AI agent that autonomously searches, navigates, and gathers data from websites. Describe what data you want and the agent handles the rest.
The agent runs asynchronously — use the returned agentId to check status and retrieve results.`,
    instructions: [
      'Provide a natural language prompt describing the data you need.',
      'Optionally constrain the agent to specific URLs or provide a JSON schema for structured output.',
      'Choose a model: spark-1-mini (default, cheaper) or spark-1-pro (higher accuracy).',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    prompt: z.string().describe('Natural language description of what data to gather (max 10,000 characters)'),
    urls: z.array(z.string()).optional().describe('URLs to constrain the agent to'),
    schema: z.record(z.string(), z.any()).optional().describe('JSON schema for structuring extracted data'),
    maxCredits: z.number().optional().describe('Maximum credits the agent can consume (default: 2500)'),
    strictConstrainToURLs: z.boolean().optional().describe('If true, agent will only visit the provided URLs'),
    model: z.enum(['spark-1-mini', 'spark-1-pro']).optional().describe('Model to use: spark-1-mini (default, 60% cheaper) or spark-1-pro (higher accuracy)'),
  }))
  .output(z.object({
    agentId: z.string().describe('Unique ID for the agent job, use to check status and retrieve results'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.startAgent({
      prompt: ctx.input.prompt,
      urls: ctx.input.urls,
      schema: ctx.input.schema,
      maxCredits: ctx.input.maxCredits,
      strictConstrainToURLs: ctx.input.strictConstrainToURLs,
      model: ctx.input.model,
    });

    return {
      output: {
        agentId: result.id,
      },
      message: `Started agent job \`${result.id}\`${ctx.input.model ? ` using ${ctx.input.model}` : ''}. Use the "Get Agent Status" tool to check progress and retrieve results.`,
    };
  });
