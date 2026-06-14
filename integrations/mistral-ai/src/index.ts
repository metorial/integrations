import { Slate } from 'slates';
import { spec } from './spec';
import {
  agentCompletionTool,
  cancelBatchJobTool,
  cancelFineTuningJobTool,
  chatCompletionTool,
  codeCompletionTool,
  createBatchJobTool,
  createEmbeddingsTool,
  createFineTuningJobTool,
  deleteFileTool,
  deleteModelTool,
  downloadFileTool,
  extractDocumentTool,
  generateSpeechTool,
  getBatchJobTool,
  getFileTool,
  getFineTuningJobTool,
  getModelTool,
  listVoicesTool,
  listBatchJobsTool,
  listFilesTool,
  listFineTuningJobsTool,
  listModelsTool,
  moderateContentTool,
  transcribeAudioTool,
  uploadFileTool
} from './tools';
import { batchJobStatusTrigger, fineTuningJobStatusTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    chatCompletionTool,
    createEmbeddingsTool,
    moderateContentTool,
    extractDocumentTool,
    listModelsTool,
    getModelTool,
    uploadFileTool,
    listFilesTool,
    getFileTool,
    downloadFileTool,
    deleteFileTool,
    transcribeAudioTool,
    generateSpeechTool,
    listVoicesTool,
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
  triggers: [inboundWebhook, fineTuningJobStatusTrigger, batchJobStatusTrigger]
});
