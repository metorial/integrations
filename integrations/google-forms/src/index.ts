import { Slate } from 'slates';
import { spec } from './spec';
import {
  createForm,
  getForm,
  updateForm,
  getResponse,
  listResponses,
  manageWatches
} from './tools';
import { newResponse, formUpdated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [createForm, getForm, updateForm, getResponse, listResponses, manageWatches],
  triggers: [inboundWebhook, newResponse, formUpdated]
});
