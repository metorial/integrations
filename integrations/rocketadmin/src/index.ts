import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConnections,
  manageConnection,
  listTables,
  getRows,
  addRow,
  updateRow,
  deleteRow,
  manageGroups,
  manageDashboards,
  manageSavedQueries,
  getAuditLogs,
  manageCompanyUsers,
  manageActionRules,
  manageTableSettings,
  exportCsv
} from './tools';
import { tableRowChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConnections,
    manageConnection,
    listTables,
    getRows,
    addRow,
    updateRow,
    deleteRow,
    manageGroups,
    manageDashboards,
    manageSavedQueries,
    getAuditLogs,
    manageCompanyUsers,
    manageActionRules,
    manageTableSettings,
    exportCsv
  ],
  triggers: [inboundWebhook, tableRowChanges]
});
