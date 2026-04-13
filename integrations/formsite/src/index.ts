import { Slate } from 'slates';
import { spec } from './spec';
import { listForms, getFormItems, getFormResults, manageWebhooks } from './tools';
import { resultCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listForms, getFormItems, getFormResults, manageWebhooks],
  triggers: [resultCompleted]
});
