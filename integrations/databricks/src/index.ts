import { Slate } from 'slates';
import { spec } from './spec';
import {
  listClusters,
  manageCluster,
  listJobs,
  manageJob,
  runJob,
  getJobRun,
  executeSql,
  listWarehouses,
  manageWarehouse,
  browseWorkspace,
  manageNotebook,
  browseCatalog,
  manageSecrets,
  listExperiments,
  searchRuns,
  listServingEndpoints,
  queryServingEndpoint,
  managePipeline,
  listPipelines,
  manageDbfs,
} from './tools';
import {
  modelRegistryTrigger,
  jobRunsTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listClusters,
    manageCluster,
    listJobs,
    manageJob,
    runJob,
    getJobRun,
    executeSql,
    listWarehouses,
    manageWarehouse,
    browseWorkspace,
    manageNotebook,
    browseCatalog,
    manageSecrets,
    listExperiments,
    searchRuns,
    listServingEndpoints,
    queryServingEndpoint,
    managePipeline,
    listPipelines,
    manageDbfs,
  ],
  triggers: [
    modelRegistryTrigger,
    jobRunsTrigger,
  ],
});
