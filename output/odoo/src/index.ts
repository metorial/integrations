import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  searchRecords,
  readRecords,
  createRecord,
  updateRecords,
  deleteRecords,
  listModelFields,
  listModels,
  executeMethod,
} from './tools';
import { recordChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchRecords,
    readRecords,
    createRecord,
    updateRecords,
    deleteRecords,
    listModelFields,
    listModels,
    executeMethod,
  ],
  triggers: [
    inboundWebhook,
    recordChanges,
  ],
});
