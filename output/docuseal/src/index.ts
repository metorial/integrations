import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  cloneTemplate,
  mergeTemplates,
  archiveTemplate,
  createSubmission,
  createSubmissionFromPdf,
  listSubmissions,
  getSubmission,
  archiveSubmission,
  listSubmitters,
  getSubmitter,
  updateSubmitter,
} from './tools';
import {
  formEvent,
  submissionEvent,
  templateEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    cloneTemplate,
    mergeTemplates,
    archiveTemplate,
    createSubmission,
    createSubmissionFromPdf,
    listSubmissions,
    getSubmission,
    archiveSubmission,
    listSubmitters,
    getSubmitter,
    updateSubmitter,
  ],
  triggers: [
    formEvent,
    submissionEvent,
    templateEvent,
  ],
});
