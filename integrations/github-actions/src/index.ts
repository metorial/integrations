import { Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkflows,
  triggerWorkflow,
  manageWorkflowState,
  listWorkflowRuns,
  getWorkflowRun,
  controlWorkflowRun,
  getWorkflowRunLogs,
  listArtifacts,
  manageArtifact,
  manageSecrets,
  manageVariables,
  manageCaches,
  manageRunners,
  managePermissions
} from './tools';
import {
  workflowRunTrigger,
  workflowJobTrigger,
  checkRunTrigger,
  deploymentStatusTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkflows,
    triggerWorkflow,
    manageWorkflowState,
    listWorkflowRuns,
    getWorkflowRun,
    controlWorkflowRun,
    getWorkflowRunLogs,
    listArtifacts,
    manageArtifact,
    manageSecrets,
    manageVariables,
    manageCaches,
    manageRunners,
    managePermissions
  ],
  triggers: [workflowRunTrigger, workflowJobTrigger, checkRunTrigger, deploymentStatusTrigger]
});
