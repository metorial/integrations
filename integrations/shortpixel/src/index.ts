import { Slate } from 'slates';
import { spec } from './spec';
import { optimizeImage, checkApiStatus, manageDomain, generateCdnUrl } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [optimizeImage, checkApiStatus, manageDomain, generateCdnUrl],
  triggers: [inboundWebhook]
});
