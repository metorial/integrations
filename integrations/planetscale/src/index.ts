import { Slate } from 'slates';
import { spec } from './spec';
import {
  listDatabases,
  getDatabase,
  createDatabase,
  updateDatabase,
  deleteDatabase,
  listBranches,
  createBranch,
  manageBranch,
  listDeployRequests,
  createDeployRequest,
  manageDeployRequest,
  managePassword,
  manageBackup,
  manageWebhook,
  getOrganization,
  listMembers,
  listAuditLogs
} from './tools';
import { branchEvents, deployRequestEvents, storageEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listDatabases,
    getDatabase,
    createDatabase,
    updateDatabase,
    deleteDatabase,
    listBranches,
    createBranch,
    manageBranch,
    listDeployRequests,
    createDeployRequest,
    manageDeployRequest,
    managePassword,
    manageBackup,
    manageWebhook,
    getOrganization,
    listMembers,
    listAuditLogs
  ] as any,
  triggers: [branchEvents, deployRequestEvents, storageEvents] as any
});
