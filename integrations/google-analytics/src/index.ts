import { Slate } from 'slates';
import { spec } from './spec';
import {
  runReport,
  runRealtimeReport,
  runFunnelReport,
  sendEvents,
  validateEvents,
  getMetadata,
  listAccountsAndProperties,
  manageDataStreams,
  manageCustomDimensions,
  manageCustomMetrics,
  manageKeyEvents,
  manageAudiences,
  auditDataAccess
} from './tools';
import { propertyChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runReport,
    runRealtimeReport,
    runFunnelReport,
    sendEvents,
    validateEvents,
    getMetadata,
    listAccountsAndProperties,
    manageDataStreams,
    manageCustomDimensions,
    manageCustomMetrics,
    manageKeyEvents,
    manageAudiences,
    auditDataAccess
  ],
  triggers: [inboundWebhook, propertyChange]
});
