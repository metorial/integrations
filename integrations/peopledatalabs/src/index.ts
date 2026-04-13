import { Slate } from 'slates';
import { spec } from './spec';
import {
  enrichPerson,
  searchPerson,
  identifyPerson,
  retrievePerson,
  enrichCompany,
  searchCompany,
  enrichIp,
  enrichJobTitle,
  enrichSkill,
  cleanCompany,
  cleanLocation,
  cleanSchool,
  autocomplete
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    enrichPerson,
    searchPerson,
    identifyPerson,
    retrievePerson,
    enrichCompany,
    searchCompany,
    enrichIp,
    enrichJobTitle,
    enrichSkill,
    cleanCompany,
    cleanLocation,
    cleanSchool,
    autocomplete
  ],
  triggers: [inboundWebhook]
});
