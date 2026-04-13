import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTeams,
  listDatabases,
  getDatabaseSchema,
  getTableSchema,
  listRecords,
  getRecord,
  createRecords,
  updateRecord,
  deleteRecords,
  executeQuery,
  executeScript,
  listFiles,
  deleteFile,
  listViews
} from './tools';
import { databaseChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTeams,
    listDatabases,
    getDatabaseSchema,
    getTableSchema,
    listRecords,
    getRecord,
    createRecords,
    updateRecord,
    deleteRecords,
    executeQuery,
    executeScript,
    listFiles,
    deleteFile,
    listViews
  ],
  triggers: [inboundWebhook, databaseChanges]
});
