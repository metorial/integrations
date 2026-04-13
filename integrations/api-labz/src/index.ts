import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateBusinessReport,
  extractIdData,
  convertDocument,
  pdfToJson,
  imageToJson,
  trackExpense,
  generateSocialMediaContent,
  textToFlowDiagram,
  textToImage,
  deepResearch,
  aiSearch,
  callModule
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateBusinessReport,
    extractIdData,
    convertDocument,
    pdfToJson,
    imageToJson,
    trackExpense,
    generateSocialMediaContent,
    textToFlowDiagram,
    textToImage,
    deepResearch,
    aiSearch,
    callModule
  ],
  triggers: [inboundWebhook]
});
