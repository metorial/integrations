import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let listEventTypes = SlateTool.create(spec, {
  name: 'List Event Types',
  key: 'list_event_types',
  description: `List registered event types in your Svix environment. Event types categorize webhook messages and allow consumers to subscribe to specific events.`,
  tags: {
    readOnly: true
  }
})
  .input(
    z.object({
      limit: z.number().optional().describe('Maximum number of event types to return'),
      iterator: z.string().optional().describe('Pagination cursor'),
      includeArchived: z
        .boolean()
        .optional()
        .describe('Whether to include archived event types'),
      withContent: z.boolean().optional().describe('Whether to include schema content')
    })
  )
  .output(
    z.object({
      eventTypes: z.array(
        z.object({
          name: z.string().describe('Event type name (e.g., "invoice.paid")'),
          description: z.string().describe('Description of the event type'),
          archived: z.boolean().describe('Whether the event type is archived'),
          featureFlag: z.string().optional().describe('Feature flag controlling visibility'),
          schemas: z
            .record(z.string(), z.unknown())
            .optional()
            .describe('JSON Schema for the event payload'),
          createdAt: z.string().describe('When the event type was created'),
          updatedAt: z.string().describe('When the event type was last updated')
        })
      ),
      hasMore: z.boolean().describe('Whether there are more results'),
      iterator: z.string().optional().describe('Cursor for the next page')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us'
    });

    ctx.progress('Fetching event types...');
    let result = await client.listEventTypes({
      limit: ctx.input.limit,
      iterator: ctx.input.iterator,
      includeArchived: ctx.input.includeArchived,
      withContent: ctx.input.withContent
    });

    let eventTypes = result.data.map(et => ({
      name: et.name,
      description: et.description,
      archived: et.archived,
      featureFlag: et.featureFlag,
      schemas: et.schemas,
      createdAt: et.createdAt,
      updatedAt: et.updatedAt
    }));

    return {
      output: {
        eventTypes,
        hasMore: !result.done,
        iterator: result.iterator
      },
      message: `Found **${eventTypes.length}** event type(s).${eventTypes.length > 0 ? '\n' + eventTypes.map(et => `- \`${et.name}\` — ${et.description}`).join('\n') : ''}`
    };
  })
  .build();

export let createEventType = SlateTool.create(spec, {
  name: 'Create Event Type',
  key: 'create_event_type',
  description: `Register a new event type in Svix. Event types are the primary way for webhook consumers to configure which events they receive. Optionally include a JSONSchema (Draft 7) to define the expected payload shape.`,
  instructions: [
    'Event type names must match the pattern [a-zA-Z0-9\\-_.]+. Use dot-separated naming like "group.event" (e.g., "invoice.paid").',
    'Schemas use JSONSchema Draft 7 format.'
  ]
})
  .input(
    z.object({
      name: z
        .string()
        .describe('Event type name (e.g., "invoice.paid"). Must match [a-zA-Z0-9\\-_.]+'),
      description: z.string().describe('Human-readable description of the event type'),
      schemas: z
        .record(z.string(), z.unknown())
        .optional()
        .describe('JSONSchema (Draft 7) defining the expected payload shape'),
      archived: z
        .boolean()
        .optional()
        .describe('Whether to create the event type as archived'),
      featureFlag: z
        .string()
        .optional()
        .describe('Feature flag to control visibility of this event type')
    })
  )
  .output(
    z.object({
      name: z.string().describe('Event type name'),
      description: z.string().describe('Description'),
      archived: z.boolean().describe('Whether the event type is archived'),
      createdAt: z.string().describe('When the event type was created')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us'
    });

    ctx.progress('Creating event type...');
    let et = await client.createEventType({
      name: ctx.input.name,
      description: ctx.input.description,
      schemas: ctx.input.schemas,
      archived: ctx.input.archived,
      featureFlag: ctx.input.featureFlag
    });

    return {
      output: {
        name: et.name,
        description: et.description,
        archived: et.archived,
        createdAt: et.createdAt
      },
      message: `Created event type \`${et.name}\` — ${et.description}.`
    };
  })
  .build();

export let deleteEventType = SlateTool.create(spec, {
  name: 'Delete Event Type',
  key: 'delete_event_type',
  description: `Archive (soft-delete) an event type. Archived event types are hidden from consumers but can still be referenced by existing messages.`,
  tags: {
    destructive: true
  }
})
  .input(
    z.object({
      eventTypeName: z
        .string()
        .describe('Name of the event type to delete (e.g., "invoice.paid")')
    })
  )
  .output(
    z.object({
      deleted: z.boolean().describe('Whether the event type was deleted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      region: ctx.config.region || 'us'
    });

    ctx.progress('Deleting event type...');
    await client.deleteEventType(ctx.input.eventTypeName);

    return {
      output: { deleted: true },
      message: `Deleted event type \`${ctx.input.eventTypeName}\`.`
    };
  })
  .build();
