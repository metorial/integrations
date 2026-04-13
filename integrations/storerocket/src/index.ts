import { Slate } from 'slates';
import { spec } from './spec';
import { getAccountInfo, listUsers, findLocations, healthCheck } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [getAccountInfo, listUsers, findLocations, healthCheck],
  triggers: [
    inboundWebhook,
  ],
});
