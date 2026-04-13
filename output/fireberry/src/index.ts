import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getRecord,
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  queryRecords,
  getRelatedRecords,
  listObjects,
  listObjectFields,
  getPicklistValues,
} from './tools';
import { recordChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecord,
    listRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    queryRecords,
    getRelatedRecords,
    listObjects,
    listObjectFields,
    getPicklistValues,
  ],
  triggers: [
    inboundWebhook,
    recordChanged,
  ],
});
