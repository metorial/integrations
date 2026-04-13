import { Slate } from 'slates';
import { spec } from './spec';
import { listTemplates, createDocument } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [listTemplates, createDocument],
  triggers: [
    inboundWebhook,
  ],
});
