import { Slate } from 'slates';
import { spec } from './spec';
import {
  createDocument,
  getDocument,
  editDocument,
  mergeTemplate,
  listDocuments,
  manageNamedRanges
} from './tools';
import { documentChanged, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createDocument,
    getDocument,
    editDocument,
    mergeTemplate,
    listDocuments,
    manageNamedRanges
  ],
  triggers: [inboundWebhook, documentChanged]
});
