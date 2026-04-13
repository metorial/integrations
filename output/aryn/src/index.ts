import { Slate } from 'slates';
import { spec } from './spec';
import {
  parseDocument,
  listDocsets,
  getDocset,
  createDocset,
  updateDocset,
  deleteDocset,
  listDocuments,
  getDocument,
  deleteDocument,
  updateDocumentProperties,
  searchDocuments,
  extractProperties,
  deleteProperties,
  suggestProperties,
  runQuery,
  generateQueryPlan,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    parseDocument,
    listDocsets,
    getDocset,
    createDocset,
    updateDocset,
    deleteDocset,
    listDocuments,
    getDocument,
    deleteDocument,
    updateDocumentProperties,
    searchDocuments,
    extractProperties,
    deleteProperties,
    suggestProperties,
    runQuery,
    generateQueryPlan,
  ],
  triggers: [
    inboundWebhook,
  ],
});
