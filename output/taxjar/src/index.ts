import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  calculateTax,
  lookupRates,
  listCategories,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  listRefunds,
  getRefund,
  createRefund,
  updateRefund,
  deleteRefund,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listNexusRegions,
  validateAddress,
  listSummarizedRates,
} from './tools';
import {
  newOrderTrigger,
  newRefundTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    calculateTax,
    lookupRates,
    listCategories,
    listOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    listRefunds,
    getRefund,
    createRefund,
    updateRefund,
    deleteRefund,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    listNexusRegions,
    validateAddress,
    listSummarizedRates,
  ],
  triggers: [
    inboundWebhook,
    newOrderTrigger,
    newRefundTrigger,
  ],
});
