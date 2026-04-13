import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  enrichCompany,
  searchCompanies,
  screenCompanies,
  enrichPerson,
  searchPeople,
  searchJobListings,
  getSocialPosts,
  webSearch,
  getInvestorPortfolio,
  findDecisionMakers,
} from './tools';
import {
  companyScreeningPoll,
  peopleChangesPoll,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    enrichCompany,
    searchCompanies,
    screenCompanies,
    enrichPerson,
    searchPeople,
    searchJobListings,
    getSocialPosts,
    webSearch,
    getInvestorPortfolio,
    findDecisionMakers,
  ],
  triggers: [
    inboundWebhook,
    companyScreeningPoll,
    peopleChangesPoll,
  ],
});
