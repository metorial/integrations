import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  runQuery,
  runSqlQuery,
  searchDashboards,
  manageDashboard,
  manageLook,
  searchLooks,
  manageFolder,
  manageUser,
  manageGroup,
  listRoles,
  manageScheduledPlan,
  manageAlert,
  listModels,
  manageConnection,
  createEmbedUrl,
  validateContent,
} from './tools';
import {
  dashboardActivity,
  lookActivity,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runQuery,
    runSqlQuery,
    searchDashboards,
    manageDashboard,
    manageLook,
    searchLooks,
    manageFolder,
    manageUser,
    manageGroup,
    listRoles,
    manageScheduledPlan,
    manageAlert,
    listModels,
    manageConnection,
    createEmbedUrl,
    validateContent,
  ],
  triggers: [
    inboundWebhook,
    dashboardActivity,
    lookActivity,
  ],
});
