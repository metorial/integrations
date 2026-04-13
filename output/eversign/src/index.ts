import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendDocument,
  getDocument,
  listDocuments,
  cancelDocument,
  createDocumentFromTemplate,
  listTemplates,
  downloadDocument,
  manageSigner,
  listBusinesses,
  createBulkJob,
  getBulkJob,
} from './tools';
import { documentEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendDocument,
    getDocument,
    listDocuments,
    cancelDocument,
    createDocumentFromTemplate,
    listTemplates,
    downloadDocument,
    manageSigner,
    listBusinesses,
    createBulkJob,
    getBulkJob,
  ],
  triggers: [
    documentEvent,
  ],
});
