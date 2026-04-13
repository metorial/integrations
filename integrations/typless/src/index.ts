import { Slate } from 'slates';
import { spec } from './spec';
import {
  extractDocument,
  addDocumentFeedback,
  startTraining,
  listDocumentTypes,
  manageUserProfile,
  getExtractionResult
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    extractDocument,
    addDocumentFeedback,
    startTraining,
    listDocumentTypes,
    manageUserProfile,
    getExtractionResult
  ],
  triggers: [inboundWebhook]
});
