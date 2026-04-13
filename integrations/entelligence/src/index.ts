import { Slate } from 'slates';
import { spec } from './spec';
import { chatQuery, checkPermission, botQuery } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [chatQuery, checkPermission, botQuery],
  triggers: [inboundWebhook]
});
