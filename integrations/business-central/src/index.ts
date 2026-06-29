import { Slate } from 'slates';
import { spec } from './spec';
import {
  getCustomer,
  getPurchaseInvoice,
  getSalesInvoice,
  getSalesInvoicePdf,
  getVendor,
  listAccounts,
  listCompanies,
  listCustomers,
  listDocumentAttachments,
  listGeneralLedgerEntries,
  listItems,
  listJournals,
  listPurchaseInvoices,
  listSalesInvoices,
  listVendors
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listCompanies,
    listCustomers,
    getCustomer,
    listVendors,
    getVendor,
    listSalesInvoices,
    getSalesInvoice,
    getSalesInvoicePdf,
    listPurchaseInvoices,
    getPurchaseInvoice,
    listItems,
    listAccounts,
    listGeneralLedgerEntries,
    listJournals,
    listDocumentAttachments
  ],
  triggers: []
});
