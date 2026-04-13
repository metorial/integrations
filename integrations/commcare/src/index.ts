import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCases,
  getCase,
  createCase,
  updateCase,
  bulkCases,
  listForms,
  getForm,
  listMobileWorkers,
  manageMobileWorker,
  listWebUsers,
  listGroups,
  manageGroup,
  listApplications,
  listLookupTables,
  sendSms
} from './tools';
import { newFormSubmission, caseUpdated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCases,
    getCase,
    createCase,
    updateCase,
    bulkCases,
    listForms,
    getForm,
    listMobileWorkers,
    manageMobileWorker,
    listWebUsers,
    listGroups,
    manageGroup,
    listApplications,
    listLookupTables,
    sendSms
  ],
  triggers: [inboundWebhook, newFormSubmission, caseUpdated]
});
