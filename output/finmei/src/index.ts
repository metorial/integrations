import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createInvoice,
  listInvoices,
  deleteInvoice,
  manageCustomer,
  listCustomers,
  manageProduct,
  listProducts,
  getProduct,
  managePayment,
  listPayments,
  manageExpense,
  listExpenses,
  listCurrencies,
  getProfile,
} from './tools';
import {
  newInvoice,
  newPayment,
  newCustomer,
  newExpense,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createInvoice,
    listInvoices,
    deleteInvoice,
    manageCustomer,
    listCustomers,
    manageProduct,
    listProducts,
    getProduct,
    managePayment,
    listPayments,
    manageExpense,
    listExpenses,
    listCurrencies,
    getProfile,
  ],
  triggers: [
    inboundWebhook,
    newInvoice,
    newPayment,
    newCustomer,
    newExpense,
  ],
});
