import { Slate } from 'slates';
import { spec } from './spec';
import {
  getLatestNews,
  searchNews,
  getNewsSources,
  getSourceNews,
  getAvailableFilters
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [getLatestNews, searchNews, getNewsSources, getSourceNews, getAvailableFilters],
  triggers: [inboundWebhook]
});
