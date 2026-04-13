import { Slate } from 'slates';
import { spec } from './spec';
import { listCampaigns, startDeadline, trackPurchase, createCustomEvent } from './tools';
import { newCustomEvent, newPortal, newFormSubmission, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listCampaigns, startDeadline, trackPurchase, createCustomEvent],
  triggers: [inboundWebhook, newCustomEvent, newPortal, newFormSubmission]
});
