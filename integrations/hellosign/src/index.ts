import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendSignatureRequest,
  sendTemplateRequest,
  getSignatureRequest,
  listSignatureRequests,
  manageSignatureRequest,
  downloadFiles,
  listTemplates,
  getTemplate,
  manageTemplate,
  getAccount,
  getEmbeddedUrls,
  manageTeam,
} from './tools';
import {
  signatureRequestEvents,
  templateEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSignatureRequest,
    sendTemplateRequest,
    getSignatureRequest,
    listSignatureRequests,
    manageSignatureRequest,
    downloadFiles,
    listTemplates,
    getTemplate,
    manageTemplate,
    getAccount,
    getEmbeddedUrls,
    manageTeam,
  ],
  triggers: [
    signatureRequestEvents,
    templateEvents,
  ],
});
