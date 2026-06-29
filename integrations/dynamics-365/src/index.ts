import { Slate } from 'slates';
import { spec } from './spec';
import {
  associateRecords,
  createRecord,
  deleteRecord,
  disassociateRecords,
  downloadFileColumn,
  executeBatch,
  fetchXmlQuery,
  getEntityAttributes,
  getRecord,
  getRelatedRecords,
  invokeAction,
  invokeFunction,
  listEntities,
  listRecords,
  searchRecords,
  updateRecord,
  uploadFileColumn,
  whoAmI
} from './tools';
import { inboundWebhook, recordChanged } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createRecord,
    getRecord,
    updateRecord,
    deleteRecord,
    listRecords,
    fetchXmlQuery,
    searchRecords,
    downloadFileColumn,
    uploadFileColumn,
    executeBatch,
    associateRecords,
    disassociateRecords,
    getRelatedRecords,
    listEntities,
    getEntityAttributes,
    invokeFunction,
    invokeAction,
    whoAmI
  ],
  triggers: [inboundWebhook, recordChanged]
});
