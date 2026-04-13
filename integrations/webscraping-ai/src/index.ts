import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeHtml,
  extractText,
  askQuestion,
  extractFields,
  selectElements,
  getAccountInfo
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [scrapeHtml, extractText, askQuestion, extractFields, selectElements, getAccountInfo],
  triggers: [inboundWebhook]
});
