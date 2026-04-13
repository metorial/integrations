import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendEvent,
  sendBatchEvents,
  manageTransformation,
  listTransformations,
  manageLibrary,
  listLibraries,
  publishTransformations,
  manageTrackingPlan,
  listTrackingPlans,
  suppressUser,
  listRegulations,
  manageRetlSync,
  testEventDelivery,
  getEventAudit,
  getAuditLogs
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    sendEvent,
    sendBatchEvents,
    manageTransformation,
    listTransformations,
    manageLibrary,
    listLibraries,
    publishTransformations,
    manageTrackingPlan,
    listTrackingPlans,
    suppressUser,
    listRegulations,
    manageRetlSync,
    testEventDelivery,
    getEventAudit,
    getAuditLogs
  ],
  triggers: [inboundWebhook]
});
