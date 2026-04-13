import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  searchApplications,
  manageApplication,
  publishApplication,
  searchTables,
  manageTable,
  searchRows,
  manageRow,
  searchUsers,
  manageUser,
  searchQueries,
  executeQuery,
} from './tools';
import { rowChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchApplications,
    manageApplication,
    publishApplication,
    searchTables,
    manageTable,
    searchRows,
    manageRow,
    searchUsers,
    manageUser,
    searchQueries,
    executeQuery,
  ],
  triggers: [
    inboundWebhook,
    rowChanges,
  ],
});
