import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createSource,
  createDataset,
  trainModel,
  createPrediction,
  createBatchPrediction,
  createEvaluation,
  createCluster,
  createAnomalyDetector,
  createOptiml,
  executeWhizzml,
  listResources,
  getResource,
  updateResource,
  deleteResource,
  manageProject
} from './tools';
import {
  newResource,
  resourceCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSource,
    createDataset,
    trainModel,
    createPrediction,
    createBatchPrediction,
    createEvaluation,
    createCluster,
    createAnomalyDetector,
    createOptiml,
    executeWhizzml,
    listResources,
    getResource,
    updateResource,
    deleteResource,
    manageProject
  ],
  triggers: [
    inboundWebhook,
    newResource,
    resourceCompleted
  ]
});
