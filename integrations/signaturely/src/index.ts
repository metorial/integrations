import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSignatureRequest,
  listDocuments,
  listTemplates,
  getDocumentDetails
} from './tools';
import { documentSentTrigger, documentCompletedTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [createSignatureRequest, listDocuments, listTemplates, getDocumentDetails],
  triggers: [inboundWebhook, documentSentTrigger, documentCompletedTrigger]
});
