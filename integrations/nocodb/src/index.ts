import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRecords,
  getRecord,
  createRecords,
  updateRecords,
  deleteRecords,
  listBases,
  listTables,
  getTable,
  createTable,
  manageField,
  listViews,
  manageWebhook,
  linkRecords
} from './tools';
import { recordEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRecords,
    getRecord,
    createRecords,
    updateRecords,
    deleteRecords,
    listBases,
    listTables,
    getTable,
    createTable,
    manageField,
    listViews,
    manageWebhook,
    linkRecords
  ],
  triggers: [recordEvent]
});
