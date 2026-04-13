import { Slate } from 'slates';
import { spec } from './spec';
import {
  trackUsers,
  sendMessage,
  triggerCampaign,
  triggerCanvas,
  exportUsers,
  deleteUsers,
  mergeUsers,
  listCampaigns,
  getCampaignDetails,
  getCampaignAnalytics,
  listCanvases,
  getCanvasDetails,
  listSegments,
  getSegmentDetails,
  updateSubscriptionStatus,
  getSubscriptionStatus,
  listCatalogs,
  manageCatalogItems,
  manageEmailList,
  manageEmailTemplates,
  manageContentBlocks,
  getKpiAnalytics,
  getCustomEventAnalytics,
  scheduleMessage
} from './tools';
import { campaignActivity, emailBlocklistActivity, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    trackUsers,
    sendMessage,
    triggerCampaign,
    triggerCanvas,
    exportUsers,
    deleteUsers,
    mergeUsers,
    listCampaigns,
    getCampaignDetails,
    getCampaignAnalytics,
    listCanvases,
    getCanvasDetails,
    listSegments,
    getSegmentDetails,
    updateSubscriptionStatus,
    getSubscriptionStatus,
    listCatalogs,
    manageCatalogItems,
    manageEmailList,
    manageEmailTemplates,
    manageContentBlocks,
    getKpiAnalytics,
    getCustomEventAnalytics,
    scheduleMessage
  ],
  triggers: [inboundWebhook, campaignActivity, emailBlocklistActivity]
});
