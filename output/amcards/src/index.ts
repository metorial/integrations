import { Slate } from 'slates';
import { spec } from './spec';
import { sendCard, scheduleDripCampaign, cancelCards, getContacts, getCards, getUser, listTemplates } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [sendCard, scheduleDripCampaign, cancelCards, getContacts, getCards, getUser, listTemplates],
  triggers: [
    inboundWebhook,
  ],
});
