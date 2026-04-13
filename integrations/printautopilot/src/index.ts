import { Slate } from 'slates';
import { spec } from './spec';
import { submitDocument, listPrintJobs } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [submitDocument, listPrintJobs],
  triggers: [inboundWebhook]
});
