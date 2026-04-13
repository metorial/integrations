import { SlateTool } from 'slates';
import { TwilioClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let sendMessage = SlateTool.create(spec, {
  name: 'Send Message',
  key: 'send_message',
  description: `Send an SMS, MMS, or WhatsApp message to a phone number. Supports sending text messages, media attachments, and scheduled messages. Use a **From** number or a **Messaging Service SID** to send. Scheduled messages require a Messaging Service SID.`,
  instructions: [
    'Either "from" or "messagingServiceSid" must be provided.',
    'For MMS, include one or more media URLs in "mediaUrls".',
    'For WhatsApp, prefix the "to" and "from" numbers with "whatsapp:", e.g. "whatsapp:+15551234567".',
    'To schedule a message, set "sendAt" to an ISO 8601 datetime and provide "messagingServiceSid".'
  ],
  constraints: [
    'Message body can be up to 1600 characters.',
    'Up to 10 media URLs per MMS message.',
    'Scheduled messages must use a Messaging Service SID and be between 15 minutes and 7 days in the future.'
  ],
  tags: {
    destructive: false,
    readOnly: false
  }
})
  .input(
    z.object({
      to: z
        .string()
        .describe(
          'Destination phone number in E.164 format (e.g. +15551234567). For WhatsApp, prefix with "whatsapp:".'
        ),
      from: z
        .string()
        .optional()
        .describe(
          'Twilio phone number to send from in E.164 format. Required if messagingServiceSid is not provided.'
        ),
      body: z
        .string()
        .optional()
        .describe(
          'Text body of the message (up to 1600 characters). Required unless mediaUrls are provided.'
        ),
      messagingServiceSid: z
        .string()
        .optional()
        .describe(
          'SID of the Messaging Service to use (starts with MG). Required for scheduled messages.'
        ),
      mediaUrls: z
        .array(z.string())
        .optional()
        .describe('URLs of media to include (for MMS). Up to 10 URLs.'),
      statusCallbackUrl: z
        .string()
        .optional()
        .describe('URL to receive delivery status webhooks for this message.'),
      sendAt: z
        .string()
        .optional()
        .describe(
          'ISO 8601 datetime to schedule the message for future delivery. Requires messagingServiceSid.'
        )
    })
  )
  .output(
    z.object({
      messageSid: z.string().describe('Unique SID of the created message'),
      status: z
        .string()
        .describe(
          'Current status of the message (e.g. queued, sending, sent, delivered, scheduled)'
        ),
      to: z.string().describe('Recipient phone number'),
      from: z.string().nullable().describe('Sender phone number'),
      body: z.string().nullable().describe('Message body text'),
      numSegments: z.string().describe('Number of SMS segments'),
      numMedia: z.string().describe('Number of media attachments'),
      direction: z.string().describe('Message direction'),
      price: z.string().nullable().describe('Price of the message'),
      priceUnit: z.string().nullable().describe('Currency of the price'),
      dateCreated: z.string().nullable().describe('Date the message was created'),
      dateSent: z.string().nullable().describe('Date the message was sent')
    })
  )
  .handleInvocation(async ctx => {
    let client = new TwilioClient({
      accountSid: ctx.config.accountSid,
      token: ctx.auth.token,
      apiKeySid: ctx.auth.apiKeySid
    });

    let result = await client.sendMessage({
      to: ctx.input.to,
      from: ctx.input.from,
      body: ctx.input.body,
      messagingServiceSid: ctx.input.messagingServiceSid,
      mediaUrl: ctx.input.mediaUrls,
      statusCallback: ctx.input.statusCallbackUrl,
      scheduleType: ctx.input.sendAt ? 'fixed' : undefined,
      sendAt: ctx.input.sendAt
    });

    return {
      output: {
        messageSid: result.sid,
        status: result.status,
        to: result.to,
        from: result.from,
        body: result.body,
        numSegments: result.num_segments,
        numMedia: result.num_media,
        direction: result.direction,
        price: result.price,
        priceUnit: result.price_unit,
        dateCreated: result.date_created,
        dateSent: result.date_sent
      },
      message: `Message **${result.sid}** ${ctx.input.sendAt ? 'scheduled' : 'sent'} to **${ctx.input.to}** with status **${result.status}**.`
    };
  })
  .build();
