import { Slate } from 'slates';
import { spec } from './spec';
import { matchBusiness, lookupBusiness, verifyBusiness, graphqlQuery, searchBusinesses } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [matchBusiness, lookupBusiness, verifyBusiness, graphqlQuery, searchBusinesses],
  triggers: [
    inboundWebhook,
  ],
});
