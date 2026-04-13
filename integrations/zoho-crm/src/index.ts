import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecords,
  searchRecords,
  executeCoql,
  getUsers,
  getModuleMetadata,
  manageNotes,
  manageTags,
  getRelatedRecords,
  sendEmail,
  getOrganization,
} from './tools';
import { recordChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecords,
    searchRecords,
    executeCoql,
    getUsers,
    getModuleMetadata,
    manageNotes,
    manageTags,
    getRelatedRecords,
    sendEmail,
    getOrganization,
  ],
  triggers: [
    recordChanges,
  ],
});
