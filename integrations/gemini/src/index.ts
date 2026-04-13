import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateText,
  generateEmbeddings,
  generateImage,
  listModels,
  countTokens,
  listFiles,
  getFile,
  deleteFile,
  createCachedContent,
  listCachedContents,
  updateCachedContent,
  deleteCachedContent
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateText,
    generateEmbeddings,
    generateImage,
    listModels,
    countTokens,
    listFiles,
    getFile,
    deleteFile,
    createCachedContent,
    listCachedContents,
    updateCachedContent,
    deleteCachedContent
  ],
  triggers: [inboundWebhook]
});
