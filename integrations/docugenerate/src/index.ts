import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateDocument,
  listTemplates,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument
} from './tools';
import { watchNewDocument, watchNewTemplate, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateDocument,
    listTemplates,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    listDocuments,
    getDocument,
    updateDocument,
    deleteDocument
  ],
  triggers: [inboundWebhook, watchNewDocument, watchNewTemplate]
});
