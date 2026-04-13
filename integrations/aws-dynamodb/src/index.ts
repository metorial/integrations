import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTable,
  describeTable,
  listTables,
  deleteTable,
  updateTable,
  putItem,
  getItem,
  updateItem,
  deleteItem,
  queryItems,
  scanItems,
  executePartiql,
  batchWriteItems,
  batchGetItems,
  transactWrite,
  manageTtl,
  manageBackups
} from './tools';
import { streamChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTable,
    describeTable,
    listTables,
    deleteTable,
    updateTable,
    putItem,
    getItem,
    updateItem,
    deleteItem,
    queryItems,
    scanItems,
    executePartiql,
    batchWriteItems,
    batchGetItems,
    transactWrite,
    manageTtl,
    manageBackups
  ],
  triggers: [inboundWebhook, streamChanges]
});
