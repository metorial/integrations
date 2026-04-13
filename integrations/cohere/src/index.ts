import { Slate } from 'slates';
import { spec } from './spec';
import {
  chatTool,
  embedTool,
  rerankTool,
  tokenizeTool,
  detokenizeTool,
  listModelsTool,
  listDatasetsTool,
  getDatasetTool,
  deleteDatasetTool,
  createEmbedJobTool,
  listEmbedJobsTool,
  getEmbedJobTool,
  cancelEmbedJobTool
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    chatTool,
    embedTool,
    rerankTool,
    tokenizeTool,
    detokenizeTool,
    listModelsTool,
    listDatasetsTool,
    getDatasetTool,
    deleteDatasetTool,
    createEmbedJobTool,
    listEmbedJobsTool,
    getEmbedJobTool,
    cancelEmbedJobTool
  ],
  triggers: [inboundWebhook]
});
