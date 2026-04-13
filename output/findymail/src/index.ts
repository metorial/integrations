import { Slate } from 'slates';
import { spec } from './spec';
import {
  findEmail,
  verifyEmail,
  reverseEmailLookup,
  findPhone,
  enrichCompany,
  searchEmployees,
  intellimatchSearch,
  getContactLists,
  getCredits,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    findEmail,
    verifyEmail,
    reverseEmailLookup,
    findPhone,
    enrichCompany,
    searchEmployees,
    intellimatchSearch,
    getContactLists,
    getCredits,
  ],
  triggers: [
    inboundWebhook,
  ],
});
