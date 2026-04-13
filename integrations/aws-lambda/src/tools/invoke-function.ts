import { SlateTool } from 'slates';
import { createClient } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let invokeFunction = SlateTool.create(spec, {
  name: 'Invoke Function',
  key: 'invoke_function',
  description: `Invoke a Lambda function synchronously or asynchronously. **Synchronous** (RequestResponse) returns the function's output. **Asynchronous** (Event) queues the event and returns immediately. Use **DryRun** to validate permissions without executing.`,
  instructions: [
    'Synchronous invocations have a 6MB payload limit and return the function result.',
    'Asynchronous invocations have a 256KB payload limit and return a 202 status immediately.',
    'Set logType to "Tail" to get the last 4KB of execution logs in the response.'
  ]
})
  .input(
    z.object({
      functionName: z.string().describe('Function name, ARN, or partial ARN'),
      payload: z.any().optional().describe('JSON payload to send to the function'),
      invocationType: z
        .enum(['RequestResponse', 'Event', 'DryRun'])
        .optional()
        .describe('Invocation type (default: RequestResponse)'),
      qualifier: z.string().optional().describe('Version or alias to invoke'),
      logType: z
        .enum(['None', 'Tail'])
        .optional()
        .describe('Set to "Tail" to include execution logs')
    })
  )
  .output(
    z.object({
      statusCode: z
        .number()
        .optional()
        .describe('HTTP status code (200=sync, 202=async, 204=dry run)'),
      response: z.any().optional().describe('Function response payload (synchronous only)'),
      functionError: z
        .string()
        .optional()
        .describe('Error type if the function returned an error'),
      executedVersion: z.string().optional().describe('Version that was executed'),
      logResult: z
        .string()
        .optional()
        .describe('Last 4KB of execution log (when logType is Tail)')
    })
  )
  .handleInvocation(async ctx => {
    let client = createClient(ctx.config, ctx.auth);

    let result = await client.invokeFunction(ctx.input.functionName, ctx.input.payload, {
      invocationType: ctx.input.invocationType,
      logType: ctx.input.logType,
      qualifier: ctx.input.qualifier
    });

    let invType = ctx.input.invocationType || 'RequestResponse';
    let msg =
      invType === 'Event'
        ? `Function **${ctx.input.functionName}** invoked asynchronously.`
        : invType === 'DryRun'
          ? `Dry run completed for **${ctx.input.functionName}** — permissions validated.`
          : `Function **${ctx.input.functionName}** invoked successfully.`;

    return {
      output: {
        statusCode: result?.StatusCode,
        response: result,
        functionError: result?.FunctionError,
        executedVersion: result?.ExecutedVersion,
        logResult: result?.LogResult
      },
      message: msg
    };
  })
  .build();
