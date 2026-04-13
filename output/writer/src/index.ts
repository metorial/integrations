import { Slate } from 'slates';
import { spec } from './spec';
import {
  chatCompletion,
  textCompletion,
  createKnowledgeGraph,
  listKnowledgeGraphs,
  getKnowledgeGraph,
  updateKnowledgeGraph,
  deleteKnowledgeGraph,
  queryKnowledgeGraph,
  listFiles,
  getFile,
  deleteFile,
  downloadFile,
  addFileToGraph,
  removeFileFromGraph,
  invokeAgent,
  listAgents,
  getAgentDetails,
  listModels,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    chatCompletion,
    textCompletion,
    createKnowledgeGraph,
    listKnowledgeGraphs,
    getKnowledgeGraph,
    updateKnowledgeGraph,
    deleteKnowledgeGraph,
    queryKnowledgeGraph,
    listFiles,
    getFile,
    deleteFile,
    downloadFile,
    addFileToGraph,
    removeFileFromGraph,
    invokeAgent,
    listAgents,
    getAgentDetails,
    listModels,
  ],
  triggers: [
    inboundWebhook,
  ],
});
