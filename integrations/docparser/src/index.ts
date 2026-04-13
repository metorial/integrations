import {
  Slate } from 'slates';
import { spec } from './spec';
import { listParsers, listModelLayouts, importDocument, getDocumentStatus, getParsedData, reparseDocuments, reintegrateDocuments } from './tools';
import { documentParsed,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listParsers,
    listModelLayouts,
    importDocument,
    getDocumentStatus,
    getParsedData,
    reparseDocuments,
    reintegrateDocuments,
  ],
  triggers: [
    inboundWebhook,
    documentParsed,
  ],
});
