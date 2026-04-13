import { Slate } from 'slates';
import { spec } from './spec';
import { webSearch, customSearch, queryUrl, extractContent, screenshot } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [webSearch, customSearch, queryUrl, extractContent, screenshot],
  triggers: [inboundWebhook]
});
