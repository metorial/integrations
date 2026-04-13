import { Slate } from 'slates';
import { spec } from './spec';
import {
  getProfile,
  listForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  listSubmissions,
  listIntegrations,
  getIntegration,
  deleteIntegration,
  listUsers
} from './tools';
import { newSubmission, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getProfile,
    listForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    listSubmissions,
    listIntegrations,
    getIntegration,
    deleteIntegration,
    listUsers
  ],
  triggers: [inboundWebhook, newSubmission]
});
