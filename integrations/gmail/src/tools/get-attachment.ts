import { SlateTool } from 'slates';
import { Client } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let getAttachment = SlateTool.create(
  spec,
  {
    name: 'Get Attachment',
    key: 'get_attachment',
    description: `Download an email attachment by its ID. Returns the base64-encoded file data and size. Use the attachment IDs from the message's attachments list.`,
    tags: {
      readOnly: true,
    },
  }
)
  .input(z.object({
    messageId: z.string().describe('ID of the message containing the attachment.'),
    attachmentId: z.string().describe('ID of the attachment to download.'),
  }))
  .output(z.object({
    size: z.number().describe('Attachment size in bytes.'),
    data: z.string().describe('Base64url-encoded attachment data.'),
  }))
  .handleInvocation(async (ctx) => {
    let client = new Client({
      token: ctx.auth.token,
      userId: ctx.config.userId,
    });

    let attachment = await client.getAttachment(ctx.input.messageId, ctx.input.attachmentId);

    return {
      output: {
        size: attachment.size,
        data: attachment.data,
      },
      message: `Downloaded attachment (**${attachment.size}** bytes).`,
    };
  });
