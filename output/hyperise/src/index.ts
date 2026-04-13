import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listTemplates,
  createProspect,
  updateProspect,
  deleteProspect,
  getProspect,
  listProspects,
  createShortLink,
  enrichData,
  listImpressions,
  createClientAccount,
} from './tools';
import { newImageImpression,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTemplates,
    createProspect,
    updateProspect,
    deleteProspect,
    getProspect,
    listProspects,
    createShortLink,
    enrichData,
    listImpressions,
    createClientAccount,
  ],
  triggers: [
    inboundWebhook,
    newImageImpression,
  ],
});
