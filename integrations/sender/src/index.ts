import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSubscriber,
  updateSubscriber,
  getSubscriber,
  deleteSubscribers,
  listSubscribers,
  manageSubscriberGroups,
  manageGroup,
  listGroups,
  createCampaign,
  listCampaigns,
  sendTransactionalEmail,
  startWorkflow,
  listSegments,
  getCampaignStatistics,
} from './tools';
import {
  subscriberEvents,
  campaignEvents,
  groupEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSubscriber,
    updateSubscriber,
    getSubscriber,
    deleteSubscribers,
    listSubscribers,
    manageSubscriberGroups,
    manageGroup,
    listGroups,
    createCampaign,
    listCampaigns,
    sendTransactionalEmail,
    startWorkflow,
    listSegments,
    getCampaignStatistics,
  ],
  triggers: [
    subscriberEvents,
    campaignEvents,
    groupEvents,
  ],
});
