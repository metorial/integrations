import { Slate } from 'slates';
import { spec } from './spec';
import {
  analyzeText,
  detectLanguage,
  semanticSimilarity,
  compareEntities,
  translateText,
  cleanUpText,
  listLanguages,
  lookupWord
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    analyzeText,
    detectLanguage,
    semanticSimilarity,
    compareEntities,
    translateText,
    cleanUpText,
    listLanguages,
    lookupWord
  ],
  triggers: [inboundWebhook]
});
