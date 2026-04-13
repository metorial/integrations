import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageContacts,
  manageAccounts,
  manageLeads,
  manageOpportunities,
  manageCases,
  manageMeetings,
  manageCalls,
  manageTasks,
  convertLead,
  sendEmail,
  manageRelationships,
  listRecords,
  getRecord,
  manageAttachments,
  generatePdf,
  postStreamNote
} from './tools';
import { recordEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageContacts,
    manageAccounts,
    manageLeads,
    manageOpportunities,
    manageCases,
    manageMeetings,
    manageCalls,
    manageTasks,
    convertLead,
    sendEmail,
    manageRelationships,
    listRecords,
    getRecord,
    manageAttachments,
    generatePdf,
    postStreamNote
  ],
  triggers: [recordEvents]
});
