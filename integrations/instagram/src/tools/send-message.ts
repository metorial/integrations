import { SlateTool } from 'slates';
import { InstagramClient } from '../lib/client';
import { spec } from '../spec';
import { z } from 'zod';

export let sendMessageTool = SlateTool.create(spec, {
  name: 'Send Message',
  key: 'send_message',
  description: `Send a direct message to an Instagram user, or send a private reply to a comment. Supports text messages and image attachments. Also supports fetching recent conversations.`,
  instructions: [
    'Use `recipientId` for direct messages to a user.',
    'Use `commentId` to privately reply to a user who commented on your post.',
    'Set `action` to "list_conversations" to retrieve recent DM conversations.'
  ],
  constraints: [
    'You can only message users who have messaged you first (24-hour messaging window).',
    'Private replies can only be sent within 7 days of the comment.',
    'Requires the `instagram_manage_messages` permission.'
  ]
})
  .input(
    z.object({
      action: z
        .enum(['send', 'private_reply', 'list_conversations'])
        .describe('The messaging action to perform'),
      recipientId: z
        .string()
        .optional()
        .describe(
          'Instagram-scoped user ID of the message recipient — required for "send" action'
        ),
      text: z.string().optional().describe('Text message content'),
      imageUrl: z.string().optional().describe('URL of an image to send as an attachment'),
      commentId: z
        .string()
        .optional()
        .describe('Comment ID to privately reply to — required for "private_reply" action'),
      userId: z
        .string()
        .optional()
        .describe('Instagram user ID. Defaults to the authenticated user.')
    })
  )
  .output(
    z.object({
      messageId: z.string().optional().describe('ID of the sent message'),
      recipientId: z.string().optional().describe('Recipient user ID'),
      conversations: z
        .array(
          z.object({
            conversationId: z.string().describe('Conversation ID'),
            updatedTime: z.string().optional().describe('Last update time'),
            participants: z
              .array(
                z.object({
                  participantId: z.string().describe('Participant ID'),
                  name: z.string().optional().describe('Participant name')
                })
              )
              .optional()
              .describe('Conversation participants')
          })
        )
        .optional()
        .describe('List of recent conversations (for "list_conversations" action)'),
      success: z.boolean().describe('Whether the action was successful')
    })
  )
  .handleInvocation(async ctx => {
    let client = new InstagramClient({
      token: ctx.auth.token,
      apiVersion: ctx.config.apiVersion
    });

    let effectiveUserId = ctx.input.userId || ctx.auth.userId || 'me';
    let { action } = ctx.input;

    if (action === 'list_conversations') {
      let result = await client.getConversations(effectiveUserId);
      let conversations = (result.data || []).map((c: any) => ({
        conversationId: c.id,
        updatedTime: c.updated_time,
        participants: c.participants?.data?.map((p: any) => ({
          participantId: p.id,
          name: p.name
        }))
      }));

      return {
        output: {
          conversations,
          success: true
        },
        message: `Retrieved **${conversations.length}** conversations.`
      };
    }

    if (action === 'private_reply') {
      if (!ctx.input.commentId)
        throw new Error('commentId is required for "private_reply" action');
      if (!ctx.input.text) throw new Error('text is required for "private_reply" action');

      let result = await client.sendPrivateReply(ctx.input.commentId, ctx.input.text);
      return {
        output: {
          messageId: result.message_id,
          success: true
        },
        message: `Sent private reply to comment ${ctx.input.commentId}.`
      };
    }

    if (action === 'send') {
      if (!ctx.input.recipientId) throw new Error('recipientId is required for "send" action');
      if (!ctx.input.text && !ctx.input.imageUrl) {
        throw new Error('Either text or imageUrl is required for "send" action');
      }

      let result = await client.sendMessage(effectiveUserId, ctx.input.recipientId, {
        text: ctx.input.text,
        imageUrl: ctx.input.imageUrl
      });

      return {
        output: {
          messageId: result.message_id,
          recipientId: ctx.input.recipientId,
          success: true
        },
        message: `Sent message to user ${ctx.input.recipientId}.`
      };
    }

    throw new Error(`Unknown action: ${action}`);
  })
  .build();
