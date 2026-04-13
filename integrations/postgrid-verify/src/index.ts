import { Slate } from 'slates';
import { spec } from './spec';
import {
  verifyAddress,
  batchVerifyAddresses,
  autocompleteAddress,
  completeAddressSuggestion,
  verifyInternationalAddress,
  batchVerifyInternationalAddresses,
  autocompleteInternationalAddress,
  completeInternationalAddressSuggestion,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    verifyAddress,
    batchVerifyAddresses,
    autocompleteAddress,
    completeAddressSuggestion,
    verifyInternationalAddress,
    batchVerifyInternationalAddresses,
    autocompleteInternationalAddress,
    completeInternationalAddressSuggestion,
  ],
  triggers: [
    inboundWebhook,
  ],
});
