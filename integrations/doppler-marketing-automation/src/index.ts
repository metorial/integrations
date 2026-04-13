import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getLists,
  manageLists,
  getSubscriber,
  getListSubscribers,
  addOrUpdateSubscriber,
  removeSubscriber,
  importSubscribers,
  getCustomFields,
  manageCustomFields,
  getCampaigns,
  manageCampaigns,
  getCampaignReport,
  getUnsubscribed,
} from './tools';
import {
  newSubscriber,
  newUnsubscribe,
  campaignStatusChange,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getLists,
    manageLists,
    getSubscriber,
    getListSubscribers,
    addOrUpdateSubscriber,
    removeSubscriber,
    importSubscribers,
    getCustomFields,
    manageCustomFields,
    getCampaigns,
    manageCampaigns,
    getCampaignReport,
    getUnsubscribed,
  ],
  triggers: [
    inboundWebhook,
    newSubscriber,
    newUnsubscribe,
    campaignStatusChange,
  ],
});
