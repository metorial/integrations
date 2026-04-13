import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listBusinesses,
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  approveInvoice,
  cloneInvoice,
  markInvoiceSent,
  listAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
  listProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  listSalesTaxes,
  createSalesTax,
  updateSalesTax,
  archiveSalesTax,
  createTransaction,
  listVendors,
  getUser
} from './tools';
import {
  invoiceChanges,
  customerChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBusinesses,
    listCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    listInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    approveInvoice,
    cloneInvoice,
    markInvoiceSent,
    listAccounts,
    createAccount,
    updateAccount,
    archiveAccount,
    listProducts,
    createProduct,
    updateProduct,
    archiveProduct,
    listSalesTaxes,
    createSalesTax,
    updateSalesTax,
    archiveSalesTax,
    createTransaction,
    listVendors,
    getUser
  ],
  triggers: [
    inboundWebhook,
    invoiceChanges,
    customerChanges
  ]
});
