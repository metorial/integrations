import { Slate } from 'slates';
import { spec } from './spec';
import {
  getAccountInfo,
  getLists,
  manageLists,
  manageCustomFields,
  subscribe,
  unsubscribe,
  searchSubscribers,
  updateSubscriber,
  manageSuppressionList,
  manageSegments,
  manageCampaigns,
  getCampaigns,
  sendCampaign,
  getCampaignReport
} from './tools';
import { subscriberEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccountInfo,
    getLists,
    manageLists,
    manageCustomFields,
    subscribe,
    unsubscribe,
    searchSubscribers,
    updateSubscriber,
    manageSuppressionList,
    manageSegments,
    manageCampaigns,
    getCampaigns,
    sendCampaign,
    getCampaignReport
  ],
  triggers: [
    subscriberEvents
  ]
});
