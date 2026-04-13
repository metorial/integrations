import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertUser,
  getUser,
  deleteUser,
  trackEvent,
  trackPurchase,
  updateCart,
  manageLists,
  manageCampaigns,
  manageTemplates,
  manageCatalogs,
  manageSnippets,
  sendMessage,
  updateSubscriptions,
  getChannels,
  exportData
} from './tools';
import {
  systemWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    upsertUser,
    getUser,
    deleteUser,
    trackEvent,
    trackPurchase,
    updateCart,
    manageLists,
    manageCampaigns,
    manageTemplates,
    manageCatalogs,
    manageSnippets,
    sendMessage,
    updateSubscriptions,
    getChannels,
    exportData
  ],
  triggers: [
    systemWebhook
  ]
});
