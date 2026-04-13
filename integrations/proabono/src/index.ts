import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageCustomers,
  manageSubscriptions,
  manageUsages,
  manageOffers,
  manageInvoices,
  manageBalance,
  manageCustomerSettings,
  quotePricing
} from './tools';
import { customerEvents, subscriptionEvents, invoiceAndPaymentEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageCustomers,
    manageSubscriptions,
    manageUsages,
    manageOffers,
    manageInvoices,
    manageBalance,
    manageCustomerSettings,
    quotePricing
  ],
  triggers: [customerEvents, subscriptionEvents, invoiceAndPaymentEvents]
});
