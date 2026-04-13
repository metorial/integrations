import { Slate } from 'slates';
import { spec } from './spec';
import {
  chatCompletion,
  generateImage,
  textToSpeech,
  createEmbeddings,
  discoverModels,
  webSearch,
  manageRag,
  getUsage,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    chatCompletion,
    generateImage,
    textToSpeech,
    createEmbeddings,
    discoverModels,
    webSearch,
    manageRag,
    getUsage,
  ],
  triggers: [
    inboundWebhook,
  ],
});
