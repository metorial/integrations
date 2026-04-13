import { Slate } from 'slates';
import { spec } from './spec';
import {
  listServices,
  getService,
  updateService,
  manageService,
  listDeploys,
  manageDeploys,
  manageEnvVars,
  scaleService,
  manageCustomDomains,
  managePostgres,
  listPostgres,
  manageKeyValue,
  manageEnvGroups,
  manageJobs,
  manageDisks,
  queryLogs,
  getMetrics,
  manageProjects,
  listWorkspaces
} from './tools';
import { deploymentEvents, serviceEvents, databaseEvents, diskEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listServices,
    getService,
    updateService,
    manageService,
    listDeploys,
    manageDeploys,
    manageEnvVars,
    scaleService,
    manageCustomDomains,
    managePostgres,
    listPostgres,
    manageKeyValue,
    manageEnvGroups,
    manageJobs,
    manageDisks,
    queryLogs,
    getMetrics,
    manageProjects,
    listWorkspaces
  ],
  triggers: [deploymentEvents, serviceEvents, databaseEvents, diskEvents]
});
