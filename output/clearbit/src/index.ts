import { Slate } from 'slates';
import { spec } from './spec';
import {
  enrichPerson,
  enrichCompany,
  enrichCombined,
  revealCompany,
  findProspects,
  discoverCompanies,
  nameToDomain,
  getLogo,
  checkRisk,
  autocompleteCompany,
} from './tools';
import {
  enrichmentWebhook,
  audienceWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    enrichPerson,
    enrichCompany,
    enrichCombined,
    revealCompany,
    findProspects,
    discoverCompanies,
    nameToDomain,
    getLogo,
    checkRisk,
    autocompleteCompany,
  ],
  triggers: [
    enrichmentWebhook,
    audienceWebhook,
  ],
});
