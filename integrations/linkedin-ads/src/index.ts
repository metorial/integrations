import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAdAccounts,
  getAdAccount,
  listCampaignGroups,
  createCampaignGroup,
  updateCampaignGroup,
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  listCreatives,
  createCreative,
  updateCreative,
  getAdAnalytics,
  listConversionRules,
  createConversionRule,
  sendConversionEvents,
  listLeadForms,
  getLeadFormResponses
} from './tools';
import { leadFormSubmissions, campaignStatusChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAdAccounts,
    getAdAccount,
    listCampaignGroups,
    createCampaignGroup,
    updateCampaignGroup,
    listCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    listCreatives,
    createCreative,
    updateCreative,
    getAdAnalytics,
    listConversionRules,
    createConversionRule,
    sendConversionEvents,
    listLeadForms,
    getLeadFormResponses
  ],
  triggers: [inboundWebhook, leadFormSubmissions, campaignStatusChanges]
});
