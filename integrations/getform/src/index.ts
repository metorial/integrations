import { Slate } from 'slates';
import { spec } from './spec';
import { submitForm, getSubmissions } from './tools';
import { formSubmission } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [submitForm, getSubmissions],
  triggers: [formSubmission]
});
