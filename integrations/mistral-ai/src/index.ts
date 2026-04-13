import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  chatCompletionTool,
  createEmbeddingsTool,
  moderateContentTool,
  extractDocumentTool,
  listModelsTool,
  listFilesTool,
  getFileTool,
  deleteFileTool,
  createFineTuningJobTool,
  getFineTuningJobTool,
  listFineTuningJobsTool,
  cancelFineTuningJobTool,
  codeCompletionTool,
  agentCompletionTool,
  createBatchJobTool,
  getBatchJobTool,
  listBatchJobsTool,
  cancelBatchJobTool,
  deleteModelTool
} from './tools';
import {
  fineTuningJobStatusTrigger,
  batchJobStatusTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    chatCompletionTool,
    createEmbeddingsTool,
    moderateContentTool,
    extractDocumentTool,
    listModelsTool,
    listFilesTool,
    getFileTool,
    deleteFileTool,
    createFineTuningJobTool,
    getFineTuningJobTool,
    listFineTuningJobsTool,
    cancelFineTuningJobTool,
    codeCompletionTool,
    agentCompletionTool,
    createBatchJobTool,
    getBatchJobTool,
    listBatchJobsTool,
    cancelBatchJobTool,
    deleteModelTool
  ],
  triggers: [
    inboundWebhook,
    fineTuningJobStatusTrigger,
    batchJobStatusTrigger
  ]
});
