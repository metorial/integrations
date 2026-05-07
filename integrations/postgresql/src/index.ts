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
  listSchemas,
  manageRoles,
  manageSchemas,
  manageViews
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
    listSchemas,
    manageRoles,
    manageSchemas,
    manageViews
  ],
  triggers: [inboundWebhook, tableChanges]
});
