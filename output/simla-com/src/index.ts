import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listCustomers,
  getCustomer,
  createCustomer,
  editCustomer,
  listOrders,
  getOrder,
  createOrder,
  editOrder,
  listProducts,
  manageCustomerNotes,
  getReferenceData,
  listSegments,
  listUsers,
  manageTasks,
  manageOrderPayments,
  manageCustomFields,
} from './tools';
import {
  orderChanges,
  customerChanges,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCustomers,
    getCustomer,
    createCustomer,
    editCustomer,
    listOrders,
    getOrder,
    createOrder,
    editOrder,
    listProducts,
    manageCustomerNotes,
    getReferenceData,
    listSegments,
    listUsers,
    manageTasks,
    manageOrderPayments,
    manageCustomFields,
  ],
  triggers: [
    inboundWebhook,
    orderChanges,
    customerChanges,
  ],
});
