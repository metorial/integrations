import { Slate } from 'slates';
import { spec } from './spec';
import { searchArticles, topHeadlines, discoverSources } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [searchArticles, topHeadlines, discoverSources],
  triggers: [inboundWebhook]
});
