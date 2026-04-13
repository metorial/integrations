import { Slate } from 'slates';
import { spec } from './spec';
import { validateAddress, provideValidationFeedback } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [validateAddress, provideValidationFeedback],
  triggers: [inboundWebhook]
});
