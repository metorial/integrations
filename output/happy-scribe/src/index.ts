import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createOrder,
  createTranslationOrder,
  getOrder,
  confirmOrder,
  listTranscriptions,
  getTranscription,
  deleteTranscription,
  exportTranscription,
  getUploadUrl,
  listGlossaries,
  listStyleGuides,
} from './tools';
import {
  transcriptionUpdated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrder,
    createTranslationOrder,
    getOrder,
    confirmOrder,
    listTranscriptions,
    getTranscription,
    deleteTranscription,
    exportTranscription,
    getUploadUrl,
    listGlossaries,
    listStyleGuides,
  ],
  triggers: [
    inboundWebhook,
    transcriptionUpdated,
  ],
});
