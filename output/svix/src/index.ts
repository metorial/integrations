import { Slate } from 'slates';
import { spec } from './spec';
import {
  listApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  sendMessage,
  listMessages,
  createEndpoint,
  listEndpoints,
  updateEndpoint,
  deleteEndpoint,
  listEventTypes,
  createEventType,
  deleteEventType,
  listAttemptsByMessage,
  listAttemptsByEndpoint,
  resendMessage,
  recoverEndpoint,
  getPortalAccess,
  getEndpointStats,
} from './tools';
import {
  operationalWebhooksTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listApplications,
    createApplication,
    getApplication,
    updateApplication,
    deleteApplication,
    sendMessage,
    listMessages,
    createEndpoint,
    listEndpoints,
    updateEndpoint,
    deleteEndpoint,
    listEventTypes,
    createEventType,
    deleteEventType,
    listAttemptsByMessage,
    listAttemptsByEndpoint,
    resendMessage,
    recoverEndpoint,
    getPortalAccess,
    getEndpointStats,
  ],
  triggers: [
    operationalWebhooksTrigger,
  ],
});
