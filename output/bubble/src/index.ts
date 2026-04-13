import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createRecord,
  getRecord,
  searchRecords,
  updateRecord,
  replaceRecord,
  deleteRecord,
  bulkCreateRecords,
  triggerWorkflow,
  getApiSpec,
} from './tools';
import { recordChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createRecord,
    getRecord,
    searchRecords,
    updateRecord,
    replaceRecord,
    deleteRecord,
    bulkCreateRecords,
    triggerWorkflow,
    getApiSpec,
  ],
  triggers: [
    inboundWebhook,
    recordChanges,
  ],
});
