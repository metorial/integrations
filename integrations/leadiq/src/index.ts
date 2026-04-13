import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchContact,
  searchCompany,
  advancedPeopleSearch,
  getAccountCredits,
  submitDataFeedback,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchContact,
    searchCompany,
    advancedPeopleSearch,
    getAccountCredits,
    submitDataFeedback,
  ],
  triggers: [
    inboundWebhook,
  ],
});
