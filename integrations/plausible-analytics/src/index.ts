import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryAnalytics,
  getRealtimeVisitors,
  sendEvent,
  createSite,
  updateSite,
  deleteSite,
  getSite,
  listSites,
  createGoal,
  listGoals,
  deleteGoal,
  listCustomProperties,
  createCustomProperty,
  deleteCustomProperty,
  createSharedLink,
  listGuests,
  inviteGuest,
  removeGuest,
  listTeams
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    queryAnalytics,
    getRealtimeVisitors,
    sendEvent,
    createSite,
    updateSite,
    deleteSite,
    getSite,
    listSites,
    createGoal,
    listGoals,
    deleteGoal,
    listCustomProperties,
    createCustomProperty,
    deleteCustomProperty,
    createSharedLink,
    listGuests,
    inviteGuest,
    removeGuest,
    listTeams
  ],
  triggers: [inboundWebhook]
});
