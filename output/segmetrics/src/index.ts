import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertContact,
  deleteContact,
  manageTags,
  upsertOrder,
  deleteOrder,
  upsertSubscription,
  deleteSubscription,
  upsertProduct,
  recordAdPerformance,
  getReport,
  getCustomerJourney,
  getContact,
  identifyVisitor,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    upsertContact,
    deleteContact,
    manageTags,
    upsertOrder,
    deleteOrder,
    upsertSubscription,
    deleteSubscription,
    upsertProduct,
    recordAdPerformance,
    getReport,
    getCustomerJourney,
    getContact,
    identifyVisitor,
  ],
  triggers: [
    inboundWebhook,
  ],
});
