import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  updateContact,
  searchContacts,
  createList,
  searchLists,
  listProperties,
  manageProperty,
  createCampaign,
  getAccountPlan,
  manageWebhook
} from './tools';
import { emailEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    updateContact,
    searchContacts,
    createList,
    searchLists,
    listProperties,
    manageProperty,
    createCampaign,
    getAccountPlan,
    manageWebhook
  ],
  triggers: [
    emailEvent
  ]
});
