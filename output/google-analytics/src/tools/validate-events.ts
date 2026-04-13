import { SlateTool } from 'slates';
import { MeasurementProtocolClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let validateEvents = SlateTool.create(
  spec,
  {
    name: 'Validate Events',
    key: 'validate_events',
    description: `Validate event data against the GA4 Measurement Protocol without actually sending the events. Use this to test event payloads for errors before sending them to production.

Returns validation messages indicating any issues with the event data format, parameter names, or values.`,
    instructions: [
      'Use this tool before "send_events" to catch formatting issues or invalid parameters.',
    ],
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    clientId: z.string().describe('A unique client identifier (same format as send_events).'),
    userId: z.string().optional().describe('Optional known user ID.'),
    events: z.array(z.object({
      name: z.string().describe('Event name to validate.'),
      params: z.record(z.string(), z.any()).optional().describe('Event parameters to validate.'),
    })).min(1).max(25).describe('Events to validate.'),
    userProperties: z.record(z.string(), z.object({
      value: z.any(),
    })).optional().describe('User properties to validate.'),
  }))
  .output(z.object({
    validationMessages: z.array(z.object({
      fieldPath: z.string().optional(),
      description: z.string().optional(),
      validationCode: z.string().optional(),
    })).optional(),
    valid: z.boolean().describe('Whether all events passed validation.'),
  }))
  .handleInvocation(async (ctx) => {
    if (!ctx.auth.measurementId || !ctx.auth.apiSecret) {
      throw new Error('Measurement Protocol requires measurementId and apiSecret. Please configure these in your authentication settings.');
    }

    let client = new MeasurementProtocolClient({
      measurementId: ctx.auth.measurementId,
      apiSecret: ctx.auth.apiSecret,
    });

    let result = await client.validateEvents({
      clientId: ctx.input.clientId,
      userId: ctx.input.userId,
      events: ctx.input.events,
      userProperties: ctx.input.userProperties as Record<string, { value: any }> | undefined,
    });

    let messages = result.validationMessages || [];
    let isValid = messages.length === 0;

    return {
      output: {
        validationMessages: messages,
        valid: isValid,
      },
      message: isValid
        ? `All **${ctx.input.events.length}** event(s) passed validation.`
        : `Validation found **${messages.length}** issue(s): ${messages.map((m: any) => m.description).join('; ')}.`,
    };
  })
  .build();
