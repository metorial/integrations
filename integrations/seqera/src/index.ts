import { Slate } from 'slates';
import { spec } from './spec';
import {
  listPipelines,
  getPipeline,
  createPipeline,
  launchWorkflow,
  listWorkflows,
  getWorkflow,
  cancelWorkflow,
  listComputeEnvs,
  manageComputeEnv,
  listDatasets,
  manageDataset,
  listCredentials,
  manageSecrets,
  listOrganizations,
  listWorkspaces,
  manageActions,
  manageLabels,
  listParticipants
} from './tools';
import { workflowUpdate, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPipelines,
    getPipeline,
    createPipeline,
    launchWorkflow,
    listWorkflows,
    getWorkflow,
    cancelWorkflow,
    listComputeEnvs,
    manageComputeEnv,
    listDatasets,
    manageDataset,
    listCredentials,
    manageSecrets,
    listOrganizations,
    listWorkspaces,
    manageActions,
    manageLabels,
    listParticipants
  ],
  triggers: [inboundWebhook, workflowUpdate]
});
