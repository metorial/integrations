import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  searchRecords,
  vectorSearch,
  askAi,
  listBranches,
  createBranch,
  deleteBranch,
  getBranch,
  listDatabases,
  createDatabase,
  deleteDatabase,
  listWorkspaces,
  summarizeTable,
  aggregateTable,
  listTables,
  createTable,
  deleteTable,
  getTableSchema,
  addTableColumn,
  executeTransaction
} from './tools';
import { recordChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    vectorSearch,
    askAi,
    listBranches,
    createBranch,
    deleteBranch,
    getBranch,
    listDatabases,
    createDatabase,
    deleteDatabase,
    listWorkspaces,
    summarizeTable,
    aggregateTable,
    listTables,
    createTable,
    deleteTable,
    getTableSchema,
    addTableColumn,
    executeTransaction
  ],
  triggers: [inboundWebhook, recordChanges]
});
