import { Slate } from 'slates';
import { spec } from './spec';
import {
  webSearch,
  extractContent,
  crawlWebsite,
  mapWebsite,
  research,
  getUsage
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [webSearch, extractContent, crawlWebsite, mapWebsite, research, getUsage],
  triggers: [inboundWebhook]
});
