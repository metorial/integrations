import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  getProduct,
  listCards,
  sendGift,
  getOrder,
  listOrders,
  cancelOrder,
  updateOrderExpiration,
  getOrderBatch,
  listOrderBatches,
  listOrderBatchOrders,
  calculateBatchPrice,
  listPaymentMethods,
  listWorkspaces
} from './tools';
import { orderEvents, orderBatchEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    getProduct,
    listCards,
    sendGift,
    getOrder,
    listOrders,
    cancelOrder,
    updateOrderExpiration,
    getOrderBatch,
    listOrderBatches,
    listOrderBatchOrders,
    calculateBatchPrice,
    listPaymentMethods,
    listWorkspaces
  ],
  triggers: [orderEvents, orderBatchEvents]
});
