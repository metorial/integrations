import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrder,
  getOrder,
  authorizeOrder,
  captureOrder,
  managePayment,
  createInvoice,
  manageInvoice,
  listInvoices,
  searchInvoices,
  manageProduct,
  manageBillingPlan,
  createSubscription,
  manageSubscription,
  sendPayout,
  getPayout,
  manageDispute,
  searchTransactions,
  addTracking
} from './tools';
import {
  paymentEvents,
  orderEvents,
  subscriptionEvents,
  invoiceEvents,
  payoutEvents,
  disputeEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrder,
    getOrder,
    authorizeOrder,
    captureOrder,
    managePayment,
    createInvoice,
    manageInvoice,
    listInvoices,
    searchInvoices,
    manageProduct,
    manageBillingPlan,
    createSubscription,
    manageSubscription,
    sendPayout,
    getPayout,
    manageDispute,
    searchTransactions,
    addTracking
  ],
  triggers: [
    paymentEvents,
    orderEvents,
    subscriptionEvents,
    invoiceEvents,
    payoutEvents,
    disputeEvents
  ]
});
