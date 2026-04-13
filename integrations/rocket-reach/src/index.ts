import { Slate } from 'slates';
import { spec } from './spec';
import { searchPeople, lookupPerson, checkLookupStatus, searchCompanies, lookupCompany, getAccount } from './tools';
import { lookupCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [searchPeople, lookupPerson, checkLookupStatus, searchCompanies, lookupCompany, getAccount],
  triggers: [lookupCompleted],
});
