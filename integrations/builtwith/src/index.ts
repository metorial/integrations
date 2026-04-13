import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  lookupDomain,
  liveDomainDetection,
  listTechnologySites,
  findRelationships,
  getTechnologyTrends,
  resolveCompanyUrl,
  getKeywords,
  checkTrust,
  getRedirects,
  getRecommendations,
  searchProducts,
  getDomainTags,
  freeLookup,
  getFinancialData,
} from './tools';
import { newTechnologyDetection,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    lookupDomain,
    liveDomainDetection,
    listTechnologySites,
    findRelationships,
    getTechnologyTrends,
    resolveCompanyUrl,
    getKeywords,
    checkTrust,
    getRedirects,
    getRecommendations,
    searchProducts,
    getDomainTags,
    freeLookup,
    getFinancialData,
  ] as any,
  triggers: [
    inboundWebhook,
    newTechnologyDetection,
  ] as any,
});
