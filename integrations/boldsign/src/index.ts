import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendDocument,
  listDocuments,
  getDocument,
  manageDocument,
  sendFromTemplate,
  listTemplates,
  getTemplate,
  downloadDocument,
  getEmbeddedSignLink,
  listUsers,
  listBrands
} from './tools';
import { documentEvents, templateEvents, senderIdentityEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendDocument,
    listDocuments,
    getDocument,
    manageDocument,
    sendFromTemplate,
    listTemplates,
    getTemplate,
    downloadDocument,
    getEmbeddedSignLink,
    listUsers,
    listBrands
  ],
  triggers: [documentEvents, templateEvents, senderIdentityEvents]
});
