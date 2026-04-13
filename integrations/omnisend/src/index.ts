import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  getContact,
  listContacts,
  updateContact,
  createProduct,
  getProduct,
  listProducts,
  deleteProduct,
  sendEvent,
  listCampaigns,
  listAutomations,
  listCategories,
  createCategory,
  deleteCategory
} from './tools';
import { contactChanges, campaignChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    getContact,
    listContacts,
    updateContact,
    createProduct,
    getProduct,
    listProducts,
    deleteProduct,
    sendEvent,
    listCampaigns,
    listAutomations,
    listCategories,
    createCategory,
    deleteCategory
  ],
  triggers: [inboundWebhook, contactChanges, campaignChanges]
});
