import { Slate } from 'slates';
import { spec } from './spec';
import {
  enrichPerson,
  enrichCompany,
  findEmail,
  searchPhone,
  reverseLookup,
  detectJobChange,
  findPeople,
  enrichTwitter,
  getCreditBalance
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    enrichPerson,
    enrichCompany,
    findEmail,
    searchPhone,
    reverseLookup,
    detectJobChange,
    findPeople,
    enrichTwitter,
    getCreditBalance
  ],
  triggers: [inboundWebhook]
});
