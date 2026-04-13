import { Slate } from 'slates';
import { spec } from './spec';
import {
  checkHealth,
  getInstanceInfo,
  triggerWorkflow,
  listWorkspaces,
  manageWorkspace,
  listApplications,
  manageApplication,
  exportApplication,
  importApplication,
  listPages,
  listDatasources,
  queryAuditLogs,
  getCurrentUser
} from './tools';
import { workflowEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    checkHealth,
    getInstanceInfo,
    triggerWorkflow,
    listWorkspaces,
    manageWorkspace,
    listApplications,
    manageApplication,
    exportApplication,
    importApplication,
    listPages,
    listDatasources,
    queryAuditLogs,
    getCurrentUser
  ],
  triggers: [workflowEvent]
});
