import { Slate } from 'slates';
import { spec } from './spec';
import {
  listClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  listProposals,
  getProposal,
  createProposal,
  updateProposal,
  deleteProposal,
  sendProposal,
  archiveProposal,
  listSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  listLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  listTemplates,
  listActivities,
  getAccount
} from './tools';
import {
  proposalEvents,
  clientEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    listProposals,
    getProposal,
    createProposal,
    updateProposal,
    deleteProposal,
    sendProposal,
    archiveProposal,
    listSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    listLineItems,
    createLineItem,
    updateLineItem,
    deleteLineItem,
    listTemplates,
    listActivities,
    getAccount
  ],
  triggers: [
    proposalEvents,
    clientEvents
  ]
});
