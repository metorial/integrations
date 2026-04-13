import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createCampaign,
  getCampaigns,
  sendCampaign,
  updateCampaign,
  deleteCampaign,
  campaignAnalytics,
  manageMailingList,
  manageSubscriber,
  listSubscribers,
  manageCustomField,
  manageSegment,
  sendTransactionalEmail,
} from './tools';
import {
  newSubscriber,
  campaignSent,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createCampaign,
    getCampaigns,
    sendCampaign,
    updateCampaign,
    deleteCampaign,
    campaignAnalytics,
    manageMailingList,
    manageSubscriber,
    listSubscribers,
    manageCustomField,
    manageSegment,
    sendTransactionalEmail,
  ],
  triggers: [
    inboundWebhook,
    newSubscriber,
    campaignSent,
  ],
});
