import { Slate } from 'slates';
import { spec } from './spec';
import { whoisLookup, hostedDomains, domainUtilities } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [whoisLookup, hostedDomains, domainUtilities],
  triggers: [
    inboundWebhook,
  ],
});
