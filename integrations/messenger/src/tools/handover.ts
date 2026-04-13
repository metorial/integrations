import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let handover = SlateTool.create(spec, {
  name: 'Manage Thread Handover',
  key: 'manage_thread_handover',
  description: `Control conversation thread ownership between apps using the Handover Protocol. **Pass** thread control to another app (e.g., hand off to a live agent), **take** thread control back (primary receiver only), or **request** thread control from the current owner.`,
  instructions: [
    'Use "pass" to hand off the conversation to another app by providing the targetAppId.',
    'Use "take" as the primary receiver to reclaim thread control.',
    'Use "request" as a secondary receiver to ask the primary app for control.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      recipientId: z
        .string()
        .describe('Page-Scoped User ID (PSID) of the user in the conversation'),
      action: z.enum(['pass', 'take', 'request']).describe('Handover action to perform'),
      targetAppId: z
        .string()
        .optional()
        .describe('App ID to pass thread control to (required for "pass" action)'),
      metadata: z
        .string()
        .optional()
        .describe('Custom metadata string to pass along with the handover action')
    })
  )
  .output(
    z.object({
      success: z.boolean().describe('Whether the handover action was successful')
    })
  )
  .handleInvocation(async ctx => {
    let client = new Client({
      token: ctx.auth.token,
      pageId: ctx.config.pageId,
      apiVersion: ctx.config.apiVersion
    });

    let { input } = ctx;

    switch (input.action) {
      case 'pass': {
        if (!input.targetAppId) {
          throw new Error('targetAppId is required for pass action');
        }
        await client.passThreadControl(input.recipientId, input.targetAppId, input.metadata);
        break;
      }

      case 'take': {
        await client.takeThreadControl(input.recipientId, input.metadata);
        break;
      }

      case 'request': {
        await client.requestThreadControl(input.recipientId, input.metadata);
        break;
      }
    }

    let actionLabel = {
      pass: `Thread control passed to app **${input.targetAppId}**`,
      take: 'Thread control taken back',
      request: 'Thread control requested'
    }[input.action];

    return {
      output: {
        success: true
      },
      message: `${actionLabel} for user **${input.recipientId}**.`
    };
  })
  .build();
