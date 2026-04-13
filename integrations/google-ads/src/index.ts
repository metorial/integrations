import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAccounts,
  searchReports,
  manageCampaigns,
  manageAdGroups,
  manageAds,
  manageKeywords,
  manageBiddingStrategies,
  manageConversionActions,
  generateKeywordIdeas,
  uploadOfflineConversions,
  manageAudienceLists
} from './tools';
import { leadFormSubmit } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAccounts,
    searchReports,
    manageCampaigns,
    manageAdGroups,
    manageAds,
    manageKeywords,
    manageBiddingStrategies,
    manageConversionActions,
    generateKeywordIdeas,
    uploadOfflineConversions,
    manageAudienceLists
  ] as any,
  triggers: [leadFormSubmit] as any
});
