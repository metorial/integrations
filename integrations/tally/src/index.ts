import { Slate } from 'slates';
import { spec } from './spec';
import {
  listForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  listSubmissions,
  getSubmission,
  deleteSubmission,
  listQuestions,
  getUser,
  listWorkspaces,
  createWorkspace,
  deleteWorkspace,
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
    listSubmissions,
    getSubmission,
    deleteSubmission,
    listQuestions,
    getUser,
    listWorkspaces,
    createWorkspace,
    deleteWorkspace,
  ],
  triggers: [
    formResponse,
  ],
});
