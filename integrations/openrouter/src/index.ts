import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  sendChatCompletion,
  createEmbedding,
  listModels,
  getModel,
  getGenerationStats,
  getCredits,
  getKeyInfo,
  listApiKeys,
  createApiKey,
  deleteApiKey,
  listGuardrails,
  createGuardrail,
  updateGuardrail,
  deleteGuardrail,
} from './tools';
import { creditBalanceChange,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendChatCompletion,
    createEmbedding,
    listModels,
    getModel,
    getGenerationStats,
    getCredits,
    getKeyInfo,
    listApiKeys,
    createApiKey,
    deleteApiKey,
    listGuardrails,
    createGuardrail,
    updateGuardrail,
    deleteGuardrail,
  ],
  triggers: [
    inboundWebhook,
    creditBalanceChange,
  ],
});
