import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getExtractStatusTool = SlateTool.create(
  spec,
  {
    name: 'Get Extract Status',
    key: 'get_extract_status',
    description: `Check the status of an extract job and retrieve the extracted structured data when complete.`,
    instructions: [
      'Provide the extractId returned by the Extract Data tool.',
      'If status is "processing", the job is still running — check again later.',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    extractId: z.string().describe('The ID of the extract job to check'),
  }))
  .output(z.object({
    status: z.string().describe('Current status: processing, completed, failed, or cancelled'),
    extractedData: z.any().optional().describe('The extracted structured data (available when completed)'),
    tokensUsed: z.number().optional().describe('Number of tokens consumed by the extraction'),
    expiresAt: z.string().optional().describe('When the results expire'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token });

    let result = await client.getExtractStatus(ctx.input.extractId);

    return {
      output: {
        status: result.status,
        extractedData: result.data,
        tokensUsed: result.tokensUsed,
        expiresAt: result.expiresAt,
      },
      message: `Extract job \`${ctx.input.extractId}\` is **${result.status}**.${result.tokensUsed ? ` Tokens used: ${result.tokensUsed}.` : ''}`,
    };
  });
