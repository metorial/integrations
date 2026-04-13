import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listDatabases,
  createDatabase,
  getDatabase,
  deleteDatabase,
  updateDatabaseConfiguration,
  createDatabaseToken,
  invalidateDatabaseTokens,
  listGroups,
  createGroup,
  getGroup,
  deleteGroup,
  manageGroupLocations,
  createGroupToken,
  invalidateGroupTokens,
  transferGroup,
  unarchiveGroup,
  listLocations,
  getOrganization,
  manageMembers,
  manageApiTokens,
  listAuditLogs,
} from './tools';
import {
  auditLogActivity,
  databaseChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listDatabases,
    createDatabase,
    getDatabase,
    deleteDatabase,
    updateDatabaseConfiguration,
    createDatabaseToken,
    invalidateDatabaseTokens,
    listGroups,
    createGroup,
    getGroup,
    deleteGroup,
    manageGroupLocations,
    createGroupToken,
    invalidateGroupTokens,
    transferGroup,
    unarchiveGroup,
    listLocations,
    getOrganization,
    manageMembers,
    manageApiTokens,
    listAuditLogs,
  ],
  triggers: [
    inboundWebhook,
    auditLogActivity,
    databaseChanges,
  ],
});
