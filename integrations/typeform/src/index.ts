import { Slate } from 'slates';
import { spec } from './spec';
import {
  listForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  getResponses,
  deleteResponses,
  listWorkspaces,
  manageWorkspace,
  listThemes,
  manageTheme,
  manageImage,
  manageWebhook,
  manageTranslation,
  getFormInsights
} from './tools';
import { formResponse } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listForms,
    getForm,
    createForm,
    updateForm,
    deleteForm,
    getResponses,
    deleteResponses,
    listWorkspaces,
    manageWorkspace,
    listThemes,
    manageTheme,
    manageImage,
    manageWebhook,
    manageTranslation,
    getFormInsights
  ],
  triggers: [formResponse]
});
