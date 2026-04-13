import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLocations,
  listCustomers,
  listSubscribers,
  listVouchers,
  listTransactions,
  verifyCredentials,
} from './tools';
import {
  customerCreated,
  subscriberCreated,
  macTransactionCreated,
  voucherTransactionCreated,
  socialTransactionCreated,
  paidTransactionCreated,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLocations,
    listCustomers,
    listSubscribers,
    listVouchers,
    listTransactions,
    verifyCredentials,
  ],
  triggers: [
    customerCreated,
    subscriberCreated,
    macTransactionCreated,
    voucherTransactionCreated,
    socialTransactionCreated,
    paidTransactionCreated,
  ],
});
