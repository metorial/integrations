import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

let buttonSchema = z.object({
  type: z.enum(['web_url', 'postback', 'phone_number']).describe('Button type'),
  title: z.string().describe('Button label text (max 20 characters)'),
  url: z.string().optional().describe('URL to open (required for web_url type)'),
  payload: z.string().optional().describe('Data sent to webhook (required for postback type) or phone number (for phone_number type)')
});

let genericElementSchema = z.object({
  title: z.string().describe('Element title (max 80 characters)'),
  subtitle: z.string().optional().describe('Element subtitle (max 80 characters)'),
  imageUrl: z.string().optional().describe('Image URL for the element'),
  defaultActionUrl: z.string().optional().describe('URL opened when the element is tapped'),
  buttons: z.array(buttonSchema).max(3).optional().describe('Up to 3 buttons per element')
});

let receiptItemSchema = z.object({
  title: z.string().describe('Item name'),
  subtitle: z.string().optional().describe('Item description'),
  quantity: z.number().optional().describe('Item quantity'),
  price: z.number().describe('Item price'),
  currency: z.string().optional().describe('Item currency code (e.g. USD)'),
  imageUrl: z.string().optional().describe('Item image URL')
});

export let sendTemplate = SlateTool.create(
  spec,
  {
    name: 'Send Template',
    key: 'send_template',
    description: `Send a structured message template to a Messenger user. Supports **Generic** (carousel), **Button**, **Media**, and **Receipt** templates.
Choose the appropriate templateType and provide the corresponding fields.`,
    instructions: [
      'Set templateType to select which template to send, then populate the corresponding fields.',
      'Generic templates support up to 10 elements displayed as a horizontal carousel.',
      'Button templates display text with up to 3 action buttons.',
      'Media templates display an image or video with optional buttons.',
      'Receipt templates display itemized order details.'
    ],
    constraints: [
      'Generic template: max 10 elements, each with up to 3 buttons.',
      'Button template: max 3 buttons.',
      'Some templates may be restricted for EEA users.'
    ],
    tags: {
      destructive: false,
      readOnly: false
    }
  }
)
  .input(z.object({
    recipientId: z.string().describe('Page-Scoped User ID (PSID) of the message recipient'),
    templateType: z.enum(['generic', 'button', 'media', 'receipt']).describe('Type of template to send'),

    // Generic template fields
    elements: z.array(genericElementSchema).max(10).optional().describe('Elements for the generic template carousel (required for generic templateType)'),

    // Button template fields
    text: z.string().optional().describe('Text message body (required for button templateType, max 640 chars)'),
    buttons: z.array(buttonSchema).max(3).optional().describe('Buttons for the button template (required for button templateType)'),

    // Media template fields
    mediaType: z.enum(['image', 'video']).optional().describe('Media type (required for media templateType)'),
    mediaUrl: z.string().optional().describe('Facebook URL of the media (required for media templateType unless attachmentId is used)'),
    attachmentId: z.string().optional().describe('Attachment ID of previously uploaded media (alternative to mediaUrl)'),
    mediaButtons: z.array(buttonSchema).max(1).optional().describe('Optional button for the media template (max 1)'),

    // Receipt template fields
    recipientName: z.string().optional().describe('Customer name (required for receipt templateType)'),
    orderNumber: z.string().optional().describe('Unique order number (required for receipt templateType)'),
    currency: z.string().optional().describe('Currency code, e.g. USD (required for receipt templateType)'),
    paymentMethod: z.string().optional().describe('Payment method description (required for receipt templateType)'),
    orderUrl: z.string().optional().describe('URL for viewing the order'),
    timestamp: z.string().optional().describe('Order timestamp as a Unix timestamp string'),
    items: z.array(receiptItemSchema).optional().describe('Line items (required for receipt templateType)'),
    subtotal: z.number().optional().describe('Order subtotal'),
    shippingCost: z.number().optional().describe('Shipping cost'),
    totalTax: z.number().optional().describe('Total tax'),
    totalCost: z.number().optional().describe('Total cost (required for receipt templateType)'),

    messagingType: z.enum(['RESPONSE', 'UPDATE', 'MESSAGE_TAG']).default('RESPONSE').describe('The messaging type'),
    tag: z.enum(['CONFIRMED_EVENT_UPDATE', 'POST_PURCHASE_UPDATE', 'ACCOUNT_UPDATE', 'HUMAN_AGENT']).optional().describe('Message tag for sending outside the 24-hour window')
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
    let { input } = ctx;

    switch (input.templateType) {
      case 'generic': {
        if (!input.elements || input.elements.length === 0) {
          throw new Error('Elements are required for generic template');
        }
        result = await client.sendGenericTemplate({
          recipientId: input.recipientId,
          elements: input.elements,
          messagingType: input.messagingType,
          tag: input.tag
        });
        break;
      }

      case 'button': {
        if (!input.text || !input.buttons || input.buttons.length === 0) {
          throw new Error('Text and buttons are required for button template');
        }
        result = await client.sendButtonTemplate({
          recipientId: input.recipientId,
          text: input.text,
          buttons: input.buttons,
          messagingType: input.messagingType,
          tag: input.tag
        });
        break;
      }

      case 'media': {
        if (!input.mediaType) {
          throw new Error('mediaType is required for media template');
        }
        result = await client.sendMediaTemplate({
          recipientId: input.recipientId,
          mediaType: input.mediaType,
          mediaUrl: input.mediaUrl,
          attachmentId: input.attachmentId,
          buttons: input.mediaButtons,
          messagingType: input.messagingType,
          tag: input.tag
        });
        break;
      }

      case 'receipt': {
        if (!input.recipientName || !input.orderNumber || !input.currency || !input.paymentMethod || !input.items || input.totalCost === undefined) {
          throw new Error('recipientName, orderNumber, currency, paymentMethod, items, and totalCost are required for receipt template');
        }
        result = await client.sendReceiptTemplate({
          recipientId: input.recipientId,
          recipientName: input.recipientName,
          orderNumber: input.orderNumber,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          orderUrl: input.orderUrl,
          timestamp: input.timestamp,
          items: input.items,
          subtotal: input.subtotal,
          shippingCost: input.shippingCost,
          totalTax: input.totalTax,
          totalCost: input.totalCost,
          messagingType: input.messagingType,
          tag: input.tag
        });
        break;
      }
    }

    return {
      output: {
        recipientId: result.recipient_id,
        messageId: result.message_id
      },
      message: `**${input.templateType}** template sent to user **${result.recipient_id}** (message ID: ${result.message_id}).`
    };
  }).build();
