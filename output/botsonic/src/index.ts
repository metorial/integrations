import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateResponse,
  listBots,
  getBot,
  createBot,
  deleteBot,
  uploadTrainingData,
  listTrainingData,
  deleteTrainingData,
  createFaq,
  listFaqs,
  deleteFaq,
  createStarterQuestion,
  updateStarterQuestion,
  listStarterQuestions,
  deleteStarterQuestion,
  listConversations,
  getConversation,
  endChat,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateResponse,
    listBots,
    getBot,
    createBot,
    deleteBot,
    uploadTrainingData,
    listTrainingData,
    deleteTrainingData,
    createFaq,
    listFaqs,
    deleteFaq,
    createStarterQuestion,
    updateStarterQuestion,
    listStarterQuestions,
    deleteStarterQuestion,
    listConversations,
    getConversation,
    endChat,
  ],
  triggers: [
    inboundWebhook,
  ],
});
