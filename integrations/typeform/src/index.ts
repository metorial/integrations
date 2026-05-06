import { Slate } from 'slates';
import { spec } from './spec';
import {
  listForms,
  getForm,
  createForm,
  updateForm,
  patchForm,
  deleteForm,
  getResponses,
  downloadResponseFile,
  deleteResponses,
  listWorkspaces,
  manageWorkspace,
  listThemes,
  manageTheme,
  manageImage,
  manageWebhook,
  manageFormMessages,
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
    patchForm,
    deleteForm,
    getResponses,
    downloadResponseFile,
    deleteResponses,
    listWorkspaces,
    manageWorkspace,
    listThemes,
    manageTheme,
    manageImage,
    manageWebhook,
    manageFormMessages,
    manageTranslation,
    getFormInsights
  ],
  triggers: [formResponse]
});
