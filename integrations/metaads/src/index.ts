import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  listAdSets,
  getAdSet,
  createAdSet,
  updateAdSet,
  deleteAdSet,
  listAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  listAdCreatives,
  getAdCreative,
  createAdCreative,
  getInsights,
  listCustomAudiences,
  getCustomAudience,
  createCustomAudience,
  addUsersToAudience,
  deleteCustomAudience,
  sendConversionEvents,
  searchAdLibrary,
  listLeadForms,
  getLeads
} from './tools';
import {
  adAccountChanges,
  leadSubmitted
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    listAdSets,
    getAdSet,
    createAdSet,
    updateAdSet,
    deleteAdSet,
    listAds,
    getAd,
    createAd,
    updateAd,
    deleteAd,
    listAdCreatives,
    getAdCreative,
    createAdCreative,
    getInsights,
    listCustomAudiences,
    getCustomAudience,
    createCustomAudience,
    addUsersToAudience,
    deleteCustomAudience,
    sendConversionEvents,
    searchAdLibrary,
    listLeadForms,
    getLeads
  ],
  triggers: [
    adAccountChanges,
    leadSubmitted
  ]
});
