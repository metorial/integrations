import { Slate } from 'slates';
import { spec } from './spec';
import { fetchPage, renderPage, takeScreenshot, extractProduct, extractArticle, extractData } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [fetchPage, renderPage, takeScreenshot, extractProduct, extractArticle, extractData],
  triggers: [
    inboundWebhook,
  ],
});
