import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  sendInvoiceEmail,
  voidInvoice,
  createCreditNote,
  listEstimates,
  createEstimate,
  listExpenses,
  createExpense,
  recordPaymentReceived,
  listPaymentsReceived,
  listProducts,
  createProduct,
  listProjects,
  createProject,
  createTimeEntry,
  listTimeEntries,
  listBills,
  listDocumentTypes,
  listTaxes
} from './tools';
import {
  invoiceChanges,
  contactChanges,
  paymentReceivedChanges,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    listInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    sendInvoiceEmail,
    voidInvoice,
    createCreditNote,
    listEstimates,
    createEstimate,
    listExpenses,
    createExpense,
    recordPaymentReceived,
    listPaymentsReceived,
    listProducts,
    createProduct,
    listProjects,
    createProject,
    createTimeEntry,
    listTimeEntries,
    listBills,
    listDocumentTypes,
    listTaxes
  ],
  triggers: [inboundWebhook, invoiceChanges, contactChanges, paymentReceivedChanges]
});
