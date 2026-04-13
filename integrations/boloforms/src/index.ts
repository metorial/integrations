import { Slate } from 'slates';
import { spec } from './spec';
import {
  listDocuments,
  sendTemplate,
  getTemplateRespondents,
  getFormResponses
} from './tools';
import {
  documentSignatureTrigger,
  templateResponseTrigger,
  formResponseTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listDocuments, sendTemplate, getTemplateRespondents, getFormResponses],
  triggers: [documentSignatureTrigger, templateResponseTrigger, formResponseTrigger]
});
