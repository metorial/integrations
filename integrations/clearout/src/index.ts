import { Slate } from 'slates';
import { spec } from './spec';
import {
  verifyEmail,
  findEmail,
  manageBulkVerification,
  manageBulkFinder,
  reverseLookup,
  domainLookup,
  autocompleteCompany,
  getCredits
} from './tools';
import { clearoutEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    verifyEmail,
    findEmail,
    manageBulkVerification,
    manageBulkFinder,
    reverseLookup,
    domainLookup,
    autocompleteCompany,
    getCredits
  ],
  triggers: [clearoutEvents]
});
