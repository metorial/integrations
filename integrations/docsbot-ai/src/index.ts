import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTeams,
  listBots,
  getBot,
  createBot,
  updateBot,
  deleteBot,
  listSources,
  createSource,
  deleteSource,
  getUploadUrl,
  askQuestion,
  rateAnswer,
  recordEscalation,
  listQuestions,
  deleteQuestion,
  listConversations,
  getConversation,
  deleteConversation
} from './tools';
import { newQuestions, newConversations, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTeams,
    listBots,
    getBot,
    createBot,
    updateBot,
    deleteBot,
    listSources,
    createSource,
    deleteSource,
    getUploadUrl,
    askQuestion,
    rateAnswer,
    recordEscalation,
    listQuestions,
    deleteQuestion,
    listConversations,
    getConversation,
    deleteConversation
  ],
  triggers: [inboundWebhook, newQuestions, newConversations]
});
