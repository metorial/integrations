import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPods,
  getPod,
  createPod,
  updatePod,
  managePod,
  listEndpoints,
  getEndpoint,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
  runJob,
  getJobStatus,
  manageJob,
  listNetworkVolumes,
  createNetworkVolume,
  manageNetworkVolume,
  listTemplates,
  createTemplate,
  manageTemplate,
  getBilling,
} from './tools';
import { serverlessJobCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPods,
    getPod,
    createPod,
    updatePod,
    managePod,
    listEndpoints,
    getEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    runJob,
    getJobStatus,
    manageJob,
    listNetworkVolumes,
    createNetworkVolume,
    manageNetworkVolume,
    listTemplates,
    createTemplate,
    manageTemplate,
    getBilling,
  ],
  triggers: [
    serverlessJobCompleted,
  ],
});
