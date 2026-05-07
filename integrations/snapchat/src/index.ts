import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizations,
  listAdAccounts,
  listCampaigns,
  manageCampaign,
  deleteCampaign,
  listAdSquads,
  manageAdSquad,
  listAds,
  manageAd,
  listCreatives,
  manageCreative,
  createMedia,
  listAudienceSegments,
  manageAudienceSegment,
  addUsersToSegment,
  getCampaignStats,
  sendConversionEvent,
  managePixel,
  getFundingSources,
  getAudienceSize,
  getBidEstimate
} from './tools';
import { campaignStatusChange, adStatusChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizations,
    listAdAccounts,
    listCampaigns,
    manageCampaign,
    deleteCampaign,
    listAdSquads,
    manageAdSquad,
    listAds,
    manageAd,
    listCreatives,
    manageCreative,
    createMedia,
    listAudienceSegments,
    manageAudienceSegment,
    addUsersToSegment,
    getCampaignStats,
    sendConversionEvent,
    managePixel,
    getFundingSources,
    getAudienceSize,
    getBidEstimate
  ],
  triggers: [inboundWebhook, campaignStatusChange, adStatusChange]
});
