import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchAddresses,
  resolveAddress,
  verifyAddress,
  validateEmail,
  validatePhone,
  getKeyInfo,
  getUsageStats
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchAddresses,
    resolveAddress,
    verifyAddress,
    validateEmail,
    validatePhone,
    getKeyInfo,
    getUsageStats
  ],
  triggers: [inboundWebhook]
});
