import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  copyTemplate,
  moveTemplates,
  generateDocument,
  listFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  listDeliveries,
  getDelivery,
  deleteDelivery,
  listMergeHistory,
  listContentBlocks,
  listEnvelopes,
  getEnvelopeDetails,
  cancelEnvelope,
  sendEnvelopeReminder
} from './tools';
import { documentGenerated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    copyTemplate,
    moveTemplates,
    generateDocument,
    listFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    listDeliveries,
    getDelivery,
    deleteDelivery,
    listMergeHistory,
    listContentBlocks,
    listEnvelopes,
    getEnvelopeDetails,
    cancelEnvelope,
    sendEnvelopeReminder
  ],
  triggers: [inboundWebhook, documentGenerated]
});
