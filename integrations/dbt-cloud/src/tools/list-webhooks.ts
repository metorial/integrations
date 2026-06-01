import { SlateTool } from 'slates';
import { z } from 'zod';
import { Client } from '../lib/client';
import { spec } from '../spec';

export let listWebhooksTool = SlateTool.create(spec, {
  name: 'List Webhooks',
  key: 'list_webhooks',
  description: `List dbt Cloud webhook subscriptions configured for the account. Use this to discover webhook IDs before retrieving, updating, testing, or deleting a subscription.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      limit: z
        .number()
        .optional()
        .describe('Maximum number of webhook subscriptions to return'),
      offset: z.number().optional().describe('Number of webhook subscriptions to skip')
    })
  )
  .output(
    z.object({
      webhooks: z
        .array(
          z.object({
            webhookId: z.string().describe('Webhook subscription ID'),
            name: z.string().optional().describe('Webhook name'),
            eventTypes: z.array(z.string()).optional().describe('Subscribed event types'),
            clientUrl: z.string().optional().describe('Target endpoint URL'),
            active: z.boolean().optional().describe('Whether the webhook is active')
          })
        )
        .describe('Webhook subscriptions')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      accountId: ctx.config.accountId,
      baseUrl: ctx.config.baseUrl
    });

    let webhooks = await client.listWebhooks({
      limit: ctx.input.limit,
      offset: ctx.input.offset
    });

    let mapped = webhooks.map((webhook: any) => ({
      webhookId: webhook.id,
      name: webhook.name,
      eventTypes: webhook.event_types,
      clientUrl: webhook.client_url,
      active: webhook.active
    }));

    return {
      output: { webhooks: mapped },
      message: `Found **${mapped.length}** webhook subscription(s).`
    };
  })
  .build();
