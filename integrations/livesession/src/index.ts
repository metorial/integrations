import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSessions,
  listAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  listWebsites,
  createWebsite,
  createFunnel,
  deleteFunnel,
  updateFunnel,
  setFunnelFavourite,
  computeFunnel
} from './tools';
import { sessionEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSessions,
    listAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    listWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    listWebsites,
    createWebsite,
    createFunnel,
    deleteFunnel,
    updateFunnel,
    setFunnelFavourite,
    computeFunnel
  ],
  triggers: [sessionEvent]
});
