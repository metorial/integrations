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
  getProposalStats,
  listFees,
  createFee,
  updateFee,
  deleteFee,
  listSections,
  createSection,
  updateSection,
  deleteSection,
  listProposalSections,
  addProposalSection,
  updateProposalSection,
  removeProposalSection,
  listProposalFees,
  addProposalFee,
  updateProposalFee,
  removeProposalFee,
  listTemplates,
  getTemplate
} from './tools';
import {
  clientCreated,
  proposalEvents
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
    getProposalStats,
    listFees,
    createFee,
    updateFee,
    deleteFee,
    listSections,
    createSection,
    updateSection,
    deleteSection,
    listProposalSections,
    addProposalSection,
    updateProposalSection,
    removeProposalSection,
    listProposalFees,
    addProposalFee,
    updateProposalFee,
    removeProposalFee,
    listTemplates,
    getTemplate
  ],
  triggers: [
    clientCreated,
    proposalEvents
  ]
});
