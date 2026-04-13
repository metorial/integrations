import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let sendMessage = SlateTool.create(spec, {
  name: 'Send Message',
  key: 'send_message',
  description: `Send a webhook message to a specific application. The message will be dispatched to all matching endpoints of that application. Optionally auto-create the application if it doesn't exist by including application details.`,
  instructions: [
    'eventType should follow a dot-separated naming convention like "invoice.paid" or "user.created".',
    'The payload can be any JSON object and will be delivered as the webhook body.',
    'If you set an eventId, it acts as an idempotency key (unique per app for 24 hours).'
  ]
})
  .input(
    z.object({
      applicationId: z.string().describe('Application ID or UID to send the message to'),
      eventType: z.string().describe('Event type identifier (e.g., "invoice.paid")'),
      eventId: z
        .string()
        .optional()
        .describe('Unique event ID for idempotency (unique per app for ~24h)'),
      payload: z
        .record(z.string(), z.unknown())
        .describe('JSON payload delivered as the webhook body'),
      channels: z
        .array(z.string())
        .optional()
        .describe('Channels to tag the message with for endpoint filtering'),
      payloadRetentionPeriod: z
        .number()
        .optional()
        .describe('Number of days to retain the payload (default 90)'),
      autoCreateApp: z
        .object({
          name: z.string().describe('Name for the auto-created application'),
          uid: z.string().optional().describe('Custom UID for the auto-created application')
        })
        .optional()
        .describe('If provided, automatically creates the application if it does not exist')
    })
  )
  .output(
    z.object({
      messageId: z.string().describe('Svix message ID'),
      eventType: z.string().describe('Event type of the sent message'),
      eventId: z.string().optional().describe('Event ID if provided'),
      timestamp: z.string().describe('When the message was created')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us'
    });

    ctx.progress('Sending message...');
    let msg = await client.createMessage(ctx.input.applicationId, {
      eventType: ctx.input.eventType,
      eventId: ctx.input.eventId,
      payload: ctx.input.payload,
      channels: ctx.input.channels,
      payloadRetentionPeriod: ctx.input.payloadRetentionPeriod,
      application: ctx.input.autoCreateApp
        ? {
            name: ctx.input.autoCreateApp.name,
            uid: ctx.input.autoCreateApp.uid
          }
        : undefined
    });

    return {
      output: {
        messageId: msg.id,
        eventType: msg.eventType,
        eventId: msg.eventId,
        timestamp: msg.timestamp
      },
      message: `Sent **${msg.eventType}** message \`${msg.id}\` to application \`${ctx.input.applicationId}\`.`
    };
  })
  .build();
