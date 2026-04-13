import { Slate } from 'slates';
import { spec } from './spec';
import {
  createDocument,
  addRecipient,
  sendDocument,
  getDocument,
  listDocuments
} from './tools';
import {
  documentCreated,
  documentSigned,
  documentCompleted,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [createDocument, addRecipient, sendDocument, getDocument, listDocuments],
  triggers: [inboundWebhook, documentCreated, documentSigned, documentCompleted]
});
