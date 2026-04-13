import { SlateTool } from 'slates';
import { GongClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let pushDigitalInteraction = SlateTool.create(spec, {
  name: 'Push Digital Interaction',
  key: 'push_digital_interaction',
  description: `Push digital interaction events into Gong's activity timeline. Supports events like content shares and content views, enabling external engagement data to appear alongside calls and emails in Gong.`,
  tags: {
    destructive: false
  }
})
  .input(
    z.object({
      events: z
        .array(
          z.object({
            eventType: z
              .string()
              .describe('Type of event (e.g., "ContentShared", "ContentViewed")'),
            contactEmail: z.string().optional().describe('Email of the contact involved'),
            contactPhone: z.string().optional().describe('Phone number of the contact'),
            contentId: z.string().optional().describe('Identifier for the content'),
            contentTitle: z.string().optional().describe('Title of the content'),
            contentUrl: z.string().optional().describe('URL of the content'),
            eventTimestamp: z.string().describe('When the event occurred in ISO 8601 format'),
            workspaceId: z.string().optional().describe('Workspace ID'),
            customData: z
              .record(z.string(), z.string())
              .optional()
              .describe('Additional custom key-value data')
          })
        )
        .describe('Digital interaction events to push')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether events were accepted')
    })
  )
  .handleInvocation(async ctx => {
    let client = new GongClient({
      token: ctx.auth.token,
      baseUrl: ctx.auth.baseUrl
    });

    await client.postDigitalInteraction({
      events: ctx.input.events.map(e => ({
        eventType: e.eventType,
        contactEmail: e.contactEmail,
        contactPhone: e.contactPhone,
        contentId: e.contentId,
        contentTitle: e.contentTitle,
        contentUrl: e.contentUrl,
        eventTimestamp: e.eventTimestamp,
        workspaceId: e.workspaceId,
        customData: e.customData as Record<string, string> | undefined
      }))
    });

    return {
      output: { success: true },
      message: `Pushed ${ctx.input.events.length} digital interaction event(s) to Gong.`
    };
  })
  .build();
