import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendEnvelope,
  getEnvelope,
  listEnvelopes,
  downloadDocument,
  listTemplates,
  sendEnvelopeFromTemplate,
  voidEnvelope,
  createEmbeddedSigningUrl,
  getEnvelopeRecipients,
} from './tools';
import { envelopeEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendEnvelope,
    getEnvelope,
    listEnvelopes,
    downloadDocument,
    listTemplates,
    sendEnvelopeFromTemplate,
    voidEnvelope,
    createEmbeddedSigningUrl,
    getEnvelopeRecipients,
  ],
  triggers: [
    envelopeEvents,
  ],
});
