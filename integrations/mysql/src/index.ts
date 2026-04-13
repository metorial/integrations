import { Slate } from 'slates';
import { spec } from './spec';
import {
  executeQuery,
  listTables,
  describeTable,
  insertRows,
  updateRows,
  deleteRows,
  manageTable,
  manageIndexes,
  listDatabases,
  manageUsers
} from './tools';
import { tableChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    executeQuery,
    listTables,
    describeTable,
    insertRows,
    updateRows,
    deleteRows,
    manageTable,
    manageIndexes,
    listDatabases,
    manageUsers
  ],
  triggers: [inboundWebhook, tableChanges]
});
