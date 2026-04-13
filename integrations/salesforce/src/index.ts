import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  upsertRecord,
  queryRecords,
  searchRecords,
  describeObject,
  manageBulkJob,
  compositeRequest,
  runReport,
  getOrgLimits,
  manageChatter
} from './tools';
import { recordChanges, newRecord, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    upsertRecord,
    queryRecords,
    searchRecords,
    describeObject,
    manageBulkJob,
    compositeRequest,
    runReport,
    getOrgLimits,
    manageChatter
  ],
  triggers: [inboundWebhook, recordChanges, newRecord]
});
