import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeUrl,
  scrapeAmazon,
  scrapeWalmart,
  scrapeZillow,
  scrapeIdealista,
  searchGoogle,
  getUsage,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    scrapeUrl,
    scrapeAmazon,
    scrapeWalmart,
    scrapeZillow,
    scrapeIdealista,
    searchGoogle,
    getUsage,
  ],
  triggers: [
    inboundWebhook,
  ],
});
