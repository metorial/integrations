import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  manageIncident,
  manageChangeRequest,
  manageUser,
  manageGroupMembership,
  manageKnowledgeArticle,
  browseServiceCatalog,
  manageAttachment,
  importData
} from './tools';
import { recordChanges, incidentUpdates, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    manageIncident,
    manageChangeRequest,
    manageUser,
    manageGroupMembership,
    manageKnowledgeArticle,
    browseServiceCatalog,
    manageAttachment,
    importData
  ],
  triggers: [inboundWebhook, recordChanges, incidentUpdates]
});
