import { Slate } from 'slates';
import { spec } from './spec';
import { createForm, deleteForm, listSubmissions } from './tools';
import { newSubmission, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [createForm.build(), deleteForm.build(), listSubmissions.build()],
  triggers: [inboundWebhook, newSubmission.build()]
});
