import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let quickReplySchema = z.object({
  contentType: z.enum(['text', 'user_phone_number', 'user_email']).describe('Type of quick reply'),
  title: z.string().optional().describe('Title shown on the quick reply button (required for text type, max 20 chars)'),
  payload: z.string().optional().describe('Custom data sent back when the quick reply is tapped (required for text type, max 1000 chars)'),
  imageUrl: z.string().optional().describe('URL of an image to display on the quick reply button')
}).describe('A quick reply option presented to the user');

export let sendMessage = SlateTool.create(
  spec,
  {
    name: 'Send Message',
    key: 'send_message',
    description: `Send a text message or media attachment to a Messenger user. Supports plain text with optional quick reply buttons, and media attachments (images, videos, audio, files) via URL.
Use **messagingType** and **tag** to send messages outside the 24-hour messaging window.`,
    instructions: [
      'The recipientId is the Page-Scoped User ID (PSID) of the recipient.',
      'Quick replies can only be attached to text messages.',
      'For sending structured templates (carousels, buttons, receipts), use the Send Template tool instead.'
    ],
    constraints: [
      'Messages can only be sent to users who have initiated a conversation within the last 24 hours, unless a message tag is used.',
      'Quick replies are limited to 13 items.'
    ],
    tags: {
      destructive: false,
      readOnly: false
    }
  }
)
  .input(z.object({
    recipientId: z.string().describe('Page-Scoped User ID (PSID) of the message recipient'),
    text: z.string().optional().describe('Text content of the message (max 2000 characters). Required if attachmentType is not set.'),
    attachmentType: z.enum(['image', 'video', 'audio', 'file']).optional().describe('Type of media attachment to send. Required if text is not set.'),
    attachmentUrl: z.string().optional().describe('URL of the media attachment to send. Required when attachmentType is set.'),
    isReusable: z.boolean().optional().describe('Whether the attachment can be reused in future messages'),
    quickReplies: z.array(quickReplySchema).optional().describe('Quick reply buttons to display (only for text messages)'),
    messagingType: z.enum(['RESPONSE', 'UPDATE', 'MESSAGE_TAG']).default('RESPONSE').describe('The messaging type: RESPONSE (reply to user message), UPDATE (proactive update), MESSAGE_TAG (outside 24h window)'),
    tag: z.enum(['CONFIRMED_EVENT_UPDATE', 'POST_PURCHASE_UPDATE', 'ACCOUNT_UPDATE', 'HUMAN_AGENT']).optional().describe('Message tag for sending outside the 24-hour window. Required when messagingType is MESSAGE_TAG.')
  }))
  .output(z.object({
    recipientId: z.string().describe('PSID of the message recipient'),
    messageId: z.string().describe('ID of the sent message')
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      pageId: ctx.config.pageId,
      apiVersion: ctx.config.apiVersion
    });

    let result: any;

    if (ctx.input.attachmentType) {
      result = await client.sendAttachment({
        recipientId: ctx.input.recipientId,
        attachmentType: ctx.input.attachmentType,
        attachmentUrl: ctx.input.attachmentUrl,
        isReusable: ctx.input.isReusable,
        messagingType: ctx.input.messagingType,
        tag: ctx.input.tag
      });
    } else {
      result = await client.sendTextMessage({
        recipientId: ctx.input.recipientId,
        text: ctx.input.text || '',
        quickReplies: ctx.input.quickReplies,
        messagingType: ctx.input.messagingType,
        tag: ctx.input.tag
      });
    }

    return {
      output: {
        recipientId: result.recipient_id,
        messageId: result.message_id
      },
      message: `Message sent successfully to user **${result.recipient_id}** (message ID: ${result.message_id}).`
    };
  }).build();
