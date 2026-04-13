import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryChatbot,
  getChatbotSettings,
  getConversations,
  getLeads,
  listUpdatedAnswers,
  createUpdatedAnswer,
  deleteUpdatedAnswer,
  getSuggestedMessages,
  getSources,
  listChatbots,
  getAccount
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    queryChatbot,
    getChatbotSettings,
    getConversations,
    getLeads,
    listUpdatedAnswers,
    createUpdatedAnswer,
    deleteUpdatedAnswer,
    getSuggestedMessages,
    getSources,
    listChatbots,
    getAccount
  ],
  triggers: [inboundWebhook]
});
