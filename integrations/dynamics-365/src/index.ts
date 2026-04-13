import { Slate } from 'slates';
import { spec } from './spec';
import {
  createRecord,
  getRecord,
  updateRecord,
  deleteRecord,
  listRecords,
  fetchXmlQuery,
  searchRecords,
  associateRecords,
  disassociateRecords,
  getRelatedRecords,
  listEntities,
  getEntityAttributes,
  invokeFunction,
  invokeAction,
  whoAmI
} from './tools';
import { recordChanged, inboundWebhook } from './triggers';

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
