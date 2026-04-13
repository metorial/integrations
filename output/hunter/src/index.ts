import { Slate } from 'slates';
import { spec } from './spec';
import {
  domainSearch,
  emailFinder,
  emailVerifier,
  enrichPerson,
  enrichCompany,
  discoverCompanies,
  emailCount,
  manageLead,
  listLeads,
  deleteLead,
  manageLeadsList,
  manageSequence,
  getAccount,
} from './tools';
import { sequenceEmailEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    domainSearch,
    emailFinder,
    emailVerifier,
    enrichPerson,
    enrichCompany,
    discoverCompanies,
    emailCount,
    manageLead,
    listLeads,
    deleteLead,
    manageLeadsList,
    manageSequence,
    getAccount,
  ],
  triggers: [
    sequenceEmailEvent,
  ],
});
