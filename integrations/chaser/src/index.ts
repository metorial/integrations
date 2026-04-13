import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertCustomer,
  getCustomer,
  listCustomers,
  bulkUpsertCustomers,
  upsertContactPerson,
  listContactPersons,
  deleteContactPerson,
  upsertInvoice,
  getInvoice,
  listInvoices,
  bulkUpsertInvoices,
  upsertCreditNote,
  listCreditNotes,
  upsertOverpayment,
  listOverpayments,
  getOrganisation,
  syncOrganisation
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    upsertCustomer,
    getCustomer,
    listCustomers,
    bulkUpsertCustomers,
    upsertContactPerson,
    listContactPersons,
    deleteContactPerson,
    upsertInvoice,
    getInvoice,
    listInvoices,
    bulkUpsertInvoices,
    upsertCreditNote,
    listCreditNotes,
    upsertOverpayment,
    listOverpayments,
    getOrganisation,
    syncOrganisation
  ],
  triggers: [inboundWebhook]
});
