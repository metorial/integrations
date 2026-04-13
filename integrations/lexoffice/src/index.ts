import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  getContact,
  updateContact,
  listContacts,
  createInvoice,
  getInvoice,
  createQuotation,
  createCreditNote,
  createOrderConfirmation,
  manageArticle,
  listArticles,
  manageVoucher,
  listVouchers,
  getPayment,
  getProfile
} from './tools';
import {
  contactEvents,
  invoiceEvents,
  articleEvents,
  voucherEvents,
  paymentEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    getContact,
    updateContact,
    listContacts,
    createInvoice,
    getInvoice,
    createQuotation,
    createCreditNote,
    createOrderConfirmation,
    manageArticle,
    listArticles,
    manageVoucher,
    listVouchers,
    getPayment,
    getProfile
  ],
  triggers: [contactEvents, invoiceEvents, articleEvents, voucherEvents, paymentEvents]
});
