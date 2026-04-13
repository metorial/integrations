import { SlateTool } from 'slates';
import { ZoomClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let sendChatMessage = SlateTool.create(spec, {
  name: 'Send Chat Message',
  key: 'send_chat_message',
  description: `Send a Zoom Team Chat message to a channel or directly to a contact. Provide either a channel ID or contact email as the recipient.`,
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      userId: z
        .string()
        .default('me')
        .describe('Sender user ID or email. Use "me" for the authenticated user'),
      message: z.string().describe('Message content to send'),
      toChannel: z.string().optional().describe('Channel ID to send the message to'),
      toContact: z.string().optional().describe('Contact email to send a direct message to')
    })
  )
  .output(
    z.object({
      messageId: z.string().optional().describe('ID of the sent message')
    })
  )
  .handleInvocation(async ctx => {
    let client = new ZoomClient(ctx.auth.token);
    let result = await client.sendChatMessage(ctx.input.userId, {
      message: ctx.input.message,
      toChannel: ctx.input.toChannel,
      toContact: ctx.input.toContact
    });

    let recipient = ctx.input.toChannel
      ? `channel ${ctx.input.toChannel}`
      : `contact ${ctx.input.toContact}`;

    return {
      output: {
        messageId: result.id
      },
      message: `Message sent to ${recipient}.`
    };
  })
  .build();
