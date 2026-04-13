import { SlateTool } from 'slates';
import { TwitterClient } from '../lib/client';
import { dmEventSchema, mapDmEvent } from '../lib/helpers';
import { spec } from '../spec';
import { z } from 'zod';

export let getDirectMessages = SlateTool.create(spec, {
  name: 'Get Direct Messages',
  key: 'get_direct_messages',
  description: `Retrieve direct message events. Fetch all recent DM events for the authenticated user or messages from a specific conversation.`,
  tags: {
    destructive: false,
    readOnly: true
  }
})
  .input(
    z.object({
      conversationId: z
        .string()
        .optional()
        .describe('Conversation ID to get messages from (omit to get all recent DMs)'),
      maxResults: z.number().optional().describe('Number of results (default 20)'),
      paginationToken: z.string().optional().describe('Pagination token for next page')
    })
  )
  .output(
    z.object({
      messages: z.array(dmEventSchema).describe('DM events/messages'),
      nextToken: z.string().optional().describe('Pagination token for next page')
    })
  )
  .handleInvocation(async ctx => {
    let client = new TwitterClient(ctx.auth.token);
    let { conversationId, maxResults, paginationToken } = ctx.input;

    let result;
    if (conversationId) {
      result = await client.getDmConversationEvents(conversationId, {
        maxResults,
        paginationToken
      });
    } else {
      result = await client.getDmEvents({ maxResults, paginationToken });
    }

    let messages = (result.data || []).map(mapDmEvent);

    return {
      output: { messages, nextToken: result.meta?.next_token },
      message: `Retrieved **${messages.length}** message(s)${conversationId ? ` from conversation ${conversationId}` : ''}.`
    };
  })
  .build();
