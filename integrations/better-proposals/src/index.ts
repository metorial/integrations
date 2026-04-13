import { Slate } from 'slates';
import { spec } from './spec';
import {
  createProposal,
  listProposals,
  getProposal,
  getProposalCount,
  createCover,
  listTemplates,
  getTemplate,
  listCompanies,
  getCompany,
  listDocumentTypes,
  createDocumentType,
  listQuotes,
  getQuote,
  listCurrencies,
  getSettings
} from './tools';
import { proposalStatusTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createProposal,
    listProposals,
    getProposal,
    getProposalCount,
    createCover,
    listTemplates,
    getTemplate,
    listCompanies,
    getCompany,
    listDocumentTypes,
    createDocumentType,
    listQuotes,
    getQuote,
    listCurrencies,
    getSettings
  ],
  triggers: [inboundWebhook, proposalStatusTrigger]
});
