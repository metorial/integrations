import { Slate } from 'slates';
import { spec } from './spec';
import {
  submitEnquiry,
  listCustomers,
  getInvoices,
  markInvoices,
  getPayments,
  markPayments
} from './tools';
import { newInvoices, newPayments, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [submitEnquiry, listCustomers, getInvoices, markInvoices, getPayments, markPayments],
  triggers: [inboundWebhook, newInvoices, newPayments]
});
