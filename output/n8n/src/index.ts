import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  manageWorkflowTags,
  listExecutions,
  getExecution,
  retryExecution,
  stopExecution,
  deleteExecution,
  listCredentials,
  createCredential,
  deleteCredential,
  getCredentialSchema,
  listUsers,
  manageTags,
  manageVariables,
  manageProjects,
  transferResource,
  sourceControlPull,
  generateAudit
} from './tools';
import {
  workflowChanges,
  executionCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    manageWorkflowTags,
    listExecutions,
    getExecution,
    retryExecution,
    stopExecution,
    deleteExecution,
    listCredentials,
    createCredential,
    deleteCredential,
    getCredentialSchema,
    listUsers,
    manageTags,
    manageVariables,
    manageProjects,
    transferResource,
    sourceControlPull,
    generateAudit
  ],
  triggers: [
    inboundWebhook,
    workflowChanges,
    executionCompleted
  ]
});
