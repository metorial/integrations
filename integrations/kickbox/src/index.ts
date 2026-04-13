import { Slate } from 'slates';
import { spec } from './spec';
import { verifyEmail, createBatchVerification, getBatchVerificationStatus } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [verifyEmail, createBatchVerification, getBatchVerificationStatus],
  triggers: [
    inboundWebhook,
  ]
});
