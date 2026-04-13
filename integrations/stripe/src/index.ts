import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageCustomers,
  managePaymentIntents,
  manageSubscriptions,
  manageInvoices,
  manageProductsPrices,
  createRefund,
  createCheckoutSession,
  createPaymentLink,
  managePayouts,
  getBalance,
  manageCoupons,
  manageDisputes,
  searchCharges,
} from './tools';
import {
  paymentEvents,
  subscriptionEvents,
  invoiceEvents,
  customerEvents,
  checkoutEvents,
  payoutEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageCustomers,
    managePaymentIntents,
    manageSubscriptions,
    manageInvoices,
    manageProductsPrices,
    createRefund,
    createCheckoutSession,
    createPaymentLink,
    managePayouts,
    getBalance,
    manageCoupons,
    manageDisputes,
    searchCharges,
  ],
  triggers: [
    paymentEvents,
    subscriptionEvents,
    invoiceEvents,
    customerEvents,
    checkoutEvents,
    payoutEvents,
  ],
});
