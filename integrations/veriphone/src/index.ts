import { Slate } from 'slates';
import { spec } from './spec';
import { verifyPhone, generateExamplePhone } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [verifyPhone, generateExamplePhone],
  triggers: [
    inboundWebhook,
  ],
});
