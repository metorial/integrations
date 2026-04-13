import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageStores,
  createInvoice,
  getInvoices,
  refundInvoice,
  manageWallet,
  manageLightning,
  managePaymentRequests,
  managePullPayments,
  managePayouts,
  getNotifications,
  getServerInfo,
} from './tools';
import {
  invoiceEvents,
  payoutEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageStores,
    createInvoice,
    getInvoices,
    refundInvoice,
    manageWallet,
    manageLightning,
    managePaymentRequests,
    managePullPayments,
    managePayouts,
    getNotifications,
    getServerInfo,
  ],
  triggers: [
    invoiceEvents,
    payoutEvents,
  ],
});
