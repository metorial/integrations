import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchBusinesses,
  getBusinessDetails,
  getReviews,
  autocomplete,
  matchBusiness,
  searchByPhone,
  searchTransactions,
  aiChat
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchBusinesses,
    getBusinessDetails,
    getReviews,
    autocomplete,
    matchBusiness,
    searchByPhone,
    searchTransactions,
    aiChat
  ],
  triggers: [inboundWebhook]
});
