import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageQuestion,
  listQuestions,
  executeQuery,
  manageDashboard,
  listDashboards,
  manageDashboardCards,
  manageCollection,
  manageDatabase,
  searchMetabase,
  manageUser,
  managePermissions,
  manageAlert,
  managePublicLink
} from './tools';
import { alertWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageQuestion,
    listQuestions,
    executeQuery,
    manageDashboard,
    listDashboards,
    manageDashboardCards,
    manageCollection,
    manageDatabase,
    searchMetabase,
    manageUser,
    managePermissions,
    manageAlert,
    managePublicLink
  ],
  triggers: [
    alertWebhook
  ]
});
