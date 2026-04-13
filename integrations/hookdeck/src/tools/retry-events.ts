import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let retryEvents = SlateTool.create(
  spec,
  {
    name: 'Retry Events',
    key: 'retry_events',
    description: `Retry failed or pending Hookdeck events. Supports retrying a single event by ID, muting an event to cancel automatic retries, or bulk retrying events matching a filter query.`,
    instructions: [
      'Use action "retry" with an eventId to retry a single event.',
      'Use action "mute" to cancel all future automatic retries for an event.',
      'Use action "bulk_retry" with query filters to retry multiple events at once.',
    ],
    constraints: [
      'Events are limited to 50 automatic retries, but can be manually retried unlimited times.',
      'Bulk retry speed is throttled based on project throughput.',
    ],
    tags: {
      destructive: false,
      readOnly: false,
    },
  }
)
  .input(z.object({
    action: z.enum(['retry', 'mute', 'bulk_retry']).describe('Action to perform'),
    eventId: z.string().optional().describe('Event ID (required for retry and mute)'),
    query: z.record(z.string(), z.unknown()).optional().describe('Filter query for bulk_retry (e.g. { status: "FAILED", source_id: "src_..." })'),
  }))
  .output(z.object({
    eventId: z.string().optional().describe('Event ID that was retried or muted'),
    eventStatus: z.string().optional().describe('Updated event status'),
    bulkRetryId: z.string().optional().describe('Bulk retry batch ID'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({ token: ctx.auth.token, apiVersion: ctx.config.apiVersion });

    switch (ctx.input.action) {
      case 'retry': {
        let event = await client.retryEvent(ctx.input.eventId!);
        return {
          output: { eventId: event.id, eventStatus: event.status },
          message: `Retried event \`${event.id}\`. Status: **${event.status}**.`,
        };
      }
      case 'mute': {
        let event = await client.muteEvent(ctx.input.eventId!);
        return {
          output: { eventId: event.id, eventStatus: event.status },
          message: `Muted event \`${event.id}\`. All future automatic retries have been cancelled.`,
        };
      }
      case 'bulk_retry': {
        let result = await client.bulkRetryEvents(ctx.input.query || {});
        return {
          output: { bulkRetryId: result.id },
          message: `Initiated bulk retry batch \`${result.id}\`.`,
        };
      }
    }
  })
  .build();
