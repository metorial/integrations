import { Slate } from 'slates';
import { spec } from './spec';
import { sendPostcard, listTemplates, listContacts, createContact } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [sendPostcard, listTemplates, listContacts, createContact],
  triggers: [inboundWebhook]
});
