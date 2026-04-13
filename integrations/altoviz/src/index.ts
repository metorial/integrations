import { Slate } from 'slates';
import { spec } from './spec';

import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  listSaleInvoices,
  createSaleInvoice,
  updateSaleInvoice,
  deleteSaleInvoice,
  finalizeSaleInvoice,
  markInvoiceAsPaid,
  sendSaleInvoiceEmail,
  listSaleQuotes,
  createSaleQuote,
  updateSaleQuote,
  deleteSaleQuote,
  sendSaleQuoteEmail,
  listSaleCredits,
  manageSaleCredit,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listSuppliers,
  manageSupplier,
  listReceipts,
  manageReceipt,
  getSettings
} from './tools';

import {
  customerEvents,
  contactEvents,
  invoiceEvents,
  quoteEvents,
  productEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    listContacts,
    createContact,
    updateContact,
    deleteContact,
    listSaleInvoices,
    createSaleInvoice,
    updateSaleInvoice,
    deleteSaleInvoice,
    finalizeSaleInvoice,
    markInvoiceAsPaid,
    sendSaleInvoiceEmail,
    listSaleQuotes,
    createSaleQuote,
    updateSaleQuote,
    deleteSaleQuote,
    sendSaleQuoteEmail,
    listSaleCredits,
    manageSaleCredit,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    listSuppliers,
    manageSupplier,
    listReceipts,
    manageReceipt,
    getSettings
  ],
  triggers: [customerEvents, contactEvents, invoiceEvents, quoteEvents, productEvents]
});
