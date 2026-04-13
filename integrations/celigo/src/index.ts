import { Slate } from 'slates';
import { spec } from './spec';
import {
  getTokenInfo,
  listConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  listFlows,
  getFlow,
  manageFlow,
  listExports,
  manageExport,
  listImports,
  manageImport,
  listIntegrations,
  manageIntegration,
  getFlowErrors,
  resolveErrors,
  retryErrors,
  listJobs,
  getJob,
  manageUsers,
  manageState
} from './tools';
import { jobCompleted, flowErrorDetected, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getTokenInfo,
    listConnections,
    getConnection,
    createConnection,
    updateConnection,
    deleteConnection,
    listFlows,
    getFlow,
    manageFlow,
    listExports,
    manageExport,
    listImports,
    manageImport,
    listIntegrations,
    manageIntegration,
    getFlowErrors,
    resolveErrors,
    retryErrors,
    listJobs,
    getJob,
    manageUsers,
    manageState
  ],
  triggers: [inboundWebhook, jobCompleted, flowErrorDetected]
});
