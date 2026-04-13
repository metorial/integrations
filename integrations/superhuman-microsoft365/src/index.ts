import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchConversations,
  getConversationContext,
  triageConversation,
  manageReplyDraft,
  sendReply
} from './tools';
import { conversationChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchConversations,
    getConversationContext,
    triageConversation,
    manageReplyDraft,
    sendReply
  ],
  triggers: [conversationChanges]
});
