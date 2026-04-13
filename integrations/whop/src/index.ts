import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  manageProduct,
  listPlans,
  managePlan,
  listMemberships,
  manageMembership,
  listPayments,
  getPayment,
  refundPayment,
  createCheckout,
  managePromoCode,
  listMembers,
  getUser,
  listInvoices
} from './tools';
import { paymentEvents, membershipEvents, setupIntentEvents, entryEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    manageProduct,
    listPlans,
    managePlan,
    listMemberships,
    manageMembership,
    listPayments,
    getPayment,
    refundPayment,
    createCheckout,
    managePromoCode,
    listMembers,
    getUser,
    listInvoices
  ],
  triggers: [paymentEvents, membershipEvents, setupIntentEvents, entryEvents]
});
