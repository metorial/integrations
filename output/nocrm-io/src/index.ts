import { Slate } from 'slates';
import { spec } from './spec';
import {
  createLead,
  getLead,
  listLeads,
  updateLead,
  deleteLead,
  duplicateLead,
  manageLeadComments,
  getLeadHistory,
  sendLeadEmail,
  manageClientFolders,
  listUsers,
  manageTeams,
  manageProspecting,
  listPipelinesSteps,
} from './tools';
import {
  leadEvents,
  prospectEvents,
  taskEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createLead,
    getLead,
    listLeads,
    updateLead,
    deleteLead,
    duplicateLead,
    manageLeadComments,
    getLeadHistory,
    sendLeadEmail,
    manageClientFolders,
    listUsers,
    manageTeams,
    manageProspecting,
    listPipelinesSteps,
  ],
  triggers: [
    leadEvents,
    prospectEvents,
    taskEvents,
  ],
});
