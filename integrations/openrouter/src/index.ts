import { Slate } from 'slates';
import { spec } from './spec';
import {
  createApiKey,
  createEmbedding,
  createResponse,
  createGuardrail,
  deleteApiKey,
  deleteGuardrail,
  getApiKey,
  getCredits,
  getGenerationStats,
  getKeyInfo,
  getGuardrail,
  getModel,
  listEmbeddingModels,
  listApiKeys,
  listGuardrails,
  listModelEndpoints,
  listModels,
  listProviders,
  sendChatCompletion,
  updateApiKey,
  updateGuardrail
} from './tools';
import { creditBalanceChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendChatCompletion,
    createResponse,
    createEmbedding,
    listEmbeddingModels,
    listModels,
    getModel,
    listModelEndpoints,
    listProviders,
    getGenerationStats,
    getCredits,
    getKeyInfo,
    listApiKeys,
    createApiKey,
    getApiKey,
    updateApiKey,
    deleteApiKey,
    listGuardrails,
    createGuardrail,
    getGuardrail,
    updateGuardrail,
    deleteGuardrail
  ],
  triggers: [inboundWebhook, creditBalanceChange]
});
