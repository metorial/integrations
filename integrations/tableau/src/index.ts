import { Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkbooks,
  manageWorkbook,
  listDatasources,
  manageDatasource,
  listViews,
  getViewData,
  manageUsers,
  manageGroups,
  manageProjects,
  managePermissions,
  manageJobs,
  manageFavorites,
  manageFlows,
  manageCollections,
  manageAlerts,
  getSiteInfo
} from './tools';
import {
  datasourceEvents,
  workbookEvents,
  userEvents,
  labelEvents,
  siteEvents,
  viewEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkbooks,
    manageWorkbook,
    listDatasources,
    manageDatasource,
    listViews,
    getViewData,
    manageUsers,
    manageGroups,
    manageProjects,
    managePermissions,
    manageJobs,
    manageFavorites,
    manageFlows,
    manageCollections,
    manageAlerts,
    getSiteInfo
  ],
  triggers: [datasourceEvents, workbookEvents, userEvents, labelEvents, siteEvents, viewEvents]
});
