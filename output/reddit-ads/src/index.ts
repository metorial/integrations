import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getAccountInfo,
  listCampaigns,
  manageCampaign,
  listAdGroups,
  manageAdGroup,
  listAds,
  manageAd,
  getPerformanceReport,
  listCustomAudiences,
  manageCustomAudience,
  manageAudienceUsers,
  sendConversionEvents,
} from './tools';
import {
  campaignStatusChange,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccountInfo,
    listCampaigns,
    manageCampaign,
    listAdGroups,
    manageAdGroup,
    listAds,
    manageAd,
    getPerformanceReport,
    listCustomAudiences,
    manageCustomAudience,
    manageAudienceUsers,
    sendConversionEvents,
  ],
  triggers: [
    inboundWebhook,
    campaignStatusChange,
  ],
});
