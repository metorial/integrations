import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrUpdateSubscriber,
  listSubscribers,
  getSubscriber,
  deleteSubscriber,
  getSubscriberActivity,
  manageGroup,
  listGroups,
  manageGroupSubscribers,
  listSegments,
  manageCustomField,
  createCampaign,
  listCampaigns,
  scheduleOrSendCampaign,
  deleteCampaign,
  getCampaignReport,
  listAutomations,
  listForms
} from './tools';
import { subscriberEvents, campaignEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrUpdateSubscriber,
    listSubscribers,
    getSubscriber,
    deleteSubscriber,
    getSubscriberActivity,
    manageGroup,
    listGroups,
    manageGroupSubscribers,
    listSegments,
    manageCustomField,
    createCampaign,
    listCampaigns,
    scheduleOrSendCampaign,
    deleteCampaign,
    getCampaignReport,
    listAutomations,
    listForms
  ],
  triggers: [subscriberEvents, campaignEvents]
});
