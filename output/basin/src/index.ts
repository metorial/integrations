import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  listSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
  refireWebhooks,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listDomains,
  listWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from './tools';
import { newSubmission,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    listSubmissions,
    getSubmission,
    updateSubmission,
    deleteSubmission,
    refireWebhooks,
    listProjects,
    createProject,
    updateProject,
    deleteProject,
    listDomains,
    listWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
  ],
  triggers: [
    inboundWebhook,
    newSubmission,
  ],
});
