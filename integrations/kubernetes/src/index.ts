import { Slate } from 'slates';
import { spec } from './spec';
import {
  listResources,
  getResource,
  manageDeployment,
  getPodLogs,
  manageService,
  manageConfigStorage,
  manageNamespace,
  deleteResource,
  applyResource,
  clusterInfo,
  manageRbac,
  manageAutoscaler,
  manageJob
} from './tools';
import { resourceEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listResources,
    getResource,
    manageDeployment,
    getPodLogs,
    manageService,
    manageConfigStorage,
    manageNamespace,
    deleteResource,
    applyResource,
    clusterInfo,
    manageRbac,
    manageAutoscaler,
    manageJob
  ],
  triggers: [inboundWebhook, resourceEvents]
});
