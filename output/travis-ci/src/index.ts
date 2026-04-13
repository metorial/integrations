import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listRepositories,
  getRepository,
  listBuilds,
  getBuild,
  triggerBuild,
  manageBuild,
  manageJob,
  getJobLog,
  manageEnvVars,
  manageCrons,
  manageCaches,
  listBranches,
  lintTravisYml,
  listBuildRequests,
} from './tools';
import { buildEvents,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRepositories,
    getRepository,
    listBuilds,
    getBuild,
    triggerBuild,
    manageBuild,
    manageJob,
    getJobLog,
    manageEnvVars,
    manageCrons,
    manageCaches,
    listBranches,
    lintTravisYml,
    listBuildRequests,
  ],
  triggers: [
    inboundWebhook,
    buildEvents,
  ],
});
