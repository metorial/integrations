import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchEmail,
  verifyEmail,
  scanDomain,
  getSearchResult,
  createBulkSearch,
  getBulkSearchResults,
  scrapeProfile,
  scrapeCompany,
  findProfileUrl,
  searchLeads,
  searchCompanies,
  getSubscription
} from './tools';
import { bulkSearchEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchEmail,
    verifyEmail,
    scanDomain,
    getSearchResult,
    createBulkSearch,
    getBulkSearchResults,
    scrapeProfile,
    scrapeCompany,
    findProfileUrl,
    searchLeads,
    searchCompanies,
    getSubscription
  ],
  triggers: [
    bulkSearchEvent
  ]
});
