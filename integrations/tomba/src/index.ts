import { Slate } from 'slates';
import { spec } from './spec';
import {
  domainSearch,
  emailFinder,
  emailVerifier,
  authorFinder,
  linkedinFinder,
  enrich,
  phoneFinder,
  domainIntelligence,
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  listLeadLists,
  createLeadList,
  updateLeadList,
  deleteLeadList,
  getAccount,
  getUsage
} from './tools';
import { leadSaved } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    domainSearch,
    emailFinder,
    emailVerifier,
    authorFinder,
    linkedinFinder,
    enrich,
    phoneFinder,
    domainIntelligence,
    listLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    listLeadLists,
    createLeadList,
    updateLeadList,
    deleteLeadList,
    getAccount,
    getUsage
  ],
  triggers: [leadSaved]
});
