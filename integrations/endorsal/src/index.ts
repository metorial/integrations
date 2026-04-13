import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  archiveContact,
  listTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  listCampaigns,
  listWidgets,
  createSuperLink
} from './tools';
import { newTestimonial, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    getContact,
    createContact,
    updateContact,
    archiveContact,
    listTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    listCampaigns,
    listWidgets,
    createSuperLink
  ],
  triggers: [inboundWebhook, newTestimonial]
});
