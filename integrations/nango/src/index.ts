import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listIntegrations,
  manageIntegration,
  listConnections,
  manageConnection,
  proxyRequest,
  manageSync,
  getRecords,
  triggerAction,
  createConnectSession,
  manageConnectionMetadata,
} from './tools';
import {
  connectionEvents,
  syncEvents,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listIntegrations,
    manageIntegration,
    listConnections,
    manageConnection,
    proxyRequest,
    manageSync,
    getRecords,
    triggerAction,
    createConnectSession,
    manageConnectionMetadata,
  ],
  triggers: [
    inboundWebhook,
    connectionEvents,
    syncEvents,
  ],
});
