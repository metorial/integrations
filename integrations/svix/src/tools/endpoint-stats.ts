import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getEndpointStats = SlateTool.create(spec, {
  name: 'Get Endpoint Stats',
  key: 'get_endpoint_stats',
  description: `Get delivery statistics for a specific endpoint including counts of successful, pending, failed, and sending attempts. Also retrieves the endpoint's signing secret for webhook verification.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      applicationId: z.string().describe('Application ID or UID'),
      endpointId: z.string().describe('Endpoint ID or UID'),
      includeSecret: z
        .boolean()
        .optional()
        .describe('Whether to include the endpoint signing secret in the response')
    })
  )
  .output(
    z.object({
      success: z.number().describe('Number of successful deliveries'),
      pending: z.number().describe('Number of pending deliveries'),
      fail: z.number().describe('Number of failed deliveries'),
      sending: z.number().describe('Number of deliveries in progress'),
      signingSecret: z
        .string()
        .optional()
        .describe('Endpoint signing secret (only if includeSecret was true)')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us'
    });

    ctx.progress('Fetching endpoint stats...');
    let stats = await client.getEndpointStats(ctx.input.applicationId, ctx.input.endpointId);

    let signingSecret: string | undefined;
    if (ctx.input.includeSecret) {
      ctx.progress('Fetching signing secret...');
      let secret = await client.getEndpointSecret(
        ctx.input.applicationId,
        ctx.input.endpointId
      );
      signingSecret = secret.key;
    }

    return {
      output: {
        success: stats.success,
        pending: stats.pending,
        fail: stats.fail,
        sending: stats.sending,
        signingSecret
      },
      message: `Endpoint \`${ctx.input.endpointId}\` stats: **${stats.success}** success, **${stats.pending}** pending, **${stats.fail}** failed, **${stats.sending}** sending.`
    };
  })
  .build();
