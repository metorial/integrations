import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  updateContact,
  listContacts,
  createCompany,
  updateCompany,
  listCompanies,
  getMetadata,
  subscribeMarketingAudience,
} from './tools';
import {
  newContact,
  newCompany,
  billingWebhook,
  projectWebhook,
  automationWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    updateContact,
    listContacts,
    createCompany,
    updateCompany,
    listCompanies,
    getMetadata,
    subscribeMarketingAudience,
  ],
  triggers: [
    newContact,
    newCompany,
    billingWebhook,
    projectWebhook,
    automationWebhook,
  ],
});
