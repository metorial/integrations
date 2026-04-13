import { Slate } from 'slates';
import { spec } from './spec';
import { extractText, convertDocument, getAccountInfo } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [extractText, convertDocument, getAccountInfo],
  triggers: [inboundWebhook]
});
