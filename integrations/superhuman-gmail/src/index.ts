import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchConversations,
  getConversationContext,
  triageConversation,
  manageReplyDraft,
  sendReply
} from './tools';
import { conversationChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchConversations.build(),
    getConversationContext.build(),
    triageConversation.build(),
    manageReplyDraft.build(),
    sendReply.build()
  ],
  triggers: [inboundWebhook, conversationChanges.build()]
});
