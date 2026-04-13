import { Slate } from 'slates';
import { spec } from './spec';
import { scrapeWebpage, scrapeAsMarkdown, extractData, scrapeExtended, checkUsage } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [scrapeWebpage, scrapeAsMarkdown, extractData, scrapeExtended, checkUsage],
  triggers: [
    inboundWebhook,
  ],
});
