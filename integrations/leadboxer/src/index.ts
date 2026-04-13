import { Slate } from 'slates';
import { spec } from './spec';
import {
  getLeads,
  getLeadDetails,
  ipLookup,
  domainLookup,
  trackEvent,
  manageLeadTags
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [getLeads, getLeadDetails, ipLookup, domainLookup, trackEvent, manageLeadTags],
  triggers: [inboundWebhook]
});
