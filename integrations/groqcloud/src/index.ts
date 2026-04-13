import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  generateText,
  transcribeAudio,
  translateAudio,
  generateSpeech,
  analyzeImage,
  moderateContent,
  listModels,
  getModel,
  createBatch,
  getBatch,
  listBatches,
  cancelBatch,
} from './tools';
import { batchStatus,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateText,
    transcribeAudio,
    translateAudio,
    generateSpeech,
    analyzeImage,
    moderateContent,
    listModels,
    getModel,
    createBatch,
    getBatch,
    listBatches,
    cancelBatch,
  ],
  triggers: [
    inboundWebhook,
    batchStatus,
  ],
});
