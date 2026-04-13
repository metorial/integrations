import {
  Slate } from 'slates';
import { spec } from './spec';
import { createLead, createContact, createJob, searchContacts, getBrands, getOrders, getPayments } from './tools';
import { contactCreated, orderBooked, paymentCreated,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [createLead, createContact, createJob, searchContacts, getBrands, getOrders, getPayments],
  triggers: [
    inboundWebhook,contactCreated, orderBooked, paymentCreated],
});
