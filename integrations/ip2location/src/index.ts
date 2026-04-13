import { Slate } from 'slates';
import { spec } from './spec';
import { ipGeolocation, bulkIpGeolocation, domainWhois, hostedDomains } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [ipGeolocation, bulkIpGeolocation, domainWhois, hostedDomains],
  triggers: [inboundWebhook]
});
