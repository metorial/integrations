import { Slate } from 'slates';
import { spec } from './spec';
import {
  categorizeDomain,
  getCompanyData,
  getDomainLogo,
  getSocialMediaLinks,
  getTechStack,
  findSimilarDomains,
  checkParkedDomain,
  getDomainRegistration,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    categorizeDomain,
    getCompanyData,
    getDomainLogo,
    getSocialMediaLinks,
    getTechStack,
    findSimilarDomains,
    checkParkedDomain,
    getDomainRegistration,
  ],
  triggers: [
    inboundWebhook,
  ],
});
