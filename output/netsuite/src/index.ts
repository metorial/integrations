import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  upsertRecord,
  listRecords,
  querySuiteQL,
  transformRecord,
  getRecordMetadata,
} from './tools';
import { recordChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    upsertRecord,
    listRecords,
    querySuiteQL,
    transformRecord,
    getRecordMetadata,
  ],
  triggers: [
    inboundWebhook,
    recordChanges,
  ],
});
