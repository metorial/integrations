import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageSources,
  manageDestinations,
  manageConnections,
  listEvents,
  retryEvents,
  manageIssues,
  manageTransformations,
  manageBookmarks,
  configureNotifications,
  publishEvent,
  listRequests,
  listAttempts,
  queryMetrics,
  manageIssueTriggers,
  retryRequests
} from './tools';
import { issueNotification, eventSuccessful } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageSources,
    manageDestinations,
    manageConnections,
    listEvents,
    retryEvents,
    manageIssues,
    manageTransformations,
    manageBookmarks,
    configureNotifications,
    publishEvent,
    listRequests,
    listAttempts,
    queryMetrics,
    manageIssueTriggers,
    retryRequests
  ],
  triggers: [issueNotification, eventSuccessful]
});
