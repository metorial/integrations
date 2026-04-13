import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrder,
  getOrder,
  captureOrder,
  managePayment,
  createInvoice,
  manageInvoice,
  listInvoices,
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
    captureOrder,
    managePayment,
    createInvoice,
    manageInvoice,
    listInvoices,
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
