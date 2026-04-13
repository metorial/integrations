import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getAppMetadata,
  uploadFile
} from './tools';
import { recordChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    getAppMetadata,
    uploadFile
  ],
  triggers: [inboundWebhook, recordChanges]
});
