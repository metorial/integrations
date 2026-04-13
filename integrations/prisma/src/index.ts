import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkspaces,
  createProject,
  getProject,
  transferProject,
  listDatabases,
  getDatabase,
  createDatabase,
  deleteDatabase,
  listConnections,
  createConnection,
  deleteConnection,
  getDatabaseBackups,
  getDatabaseUsage,
} from './tools';
import { databaseChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkspaces,
    createProject,
    getProject,
    transferProject,
    listDatabases,
    getDatabase,
    createDatabase,
    deleteDatabase,
    listConnections,
    createConnection,
    deleteConnection,
    getDatabaseBackups,
    getDatabaseUsage,
  ],
  triggers: [
    inboundWebhook,
    databaseChanges,
  ],
});
