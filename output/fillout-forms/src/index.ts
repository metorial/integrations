import { Slate } from 'slates';
import { spec } from './spec';
import { listForms, getForm, listSubmissions, getSubmission, createSubmission, deleteSubmission } from './tools';
import { formSubmission } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listForms, getForm, listSubmissions, getSubmission, createSubmission, deleteSubmission],
  triggers: [formSubmission],
});
