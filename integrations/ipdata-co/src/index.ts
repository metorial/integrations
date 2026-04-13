import { Slate } from 'slates';
import { spec } from './spec';
import { lookupIp, bulkLookupIps, lookupAsn, checkThreat } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [lookupIp, bulkLookupIps, lookupAsn, checkThreat],
  triggers: [inboundWebhook]
});
