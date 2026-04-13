import { Slate } from 'slates';
import { spec } from './spec';
import { getWebsiteRank, getTopWebsites, getRemainingCredits } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [getWebsiteRank, getTopWebsites, getRemainingCredits],
  triggers: [inboundWebhook]
});
