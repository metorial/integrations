import { Slate } from 'slates';
import { spec } from './spec';
import { lookupPlacekey, bulkLookupPlacekeys } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [lookupPlacekey, bulkLookupPlacekeys],
  triggers: [
    inboundWebhook,
  ],
});
