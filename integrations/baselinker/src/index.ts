import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getOrders,
  createOrder,
  updateOrder,
  manageOrderProducts,
  addOrderPayment,
  getOrderStatuses,
  getInventories,
  getInventoryProducts,
  manageInventoryProducts,
  updateInventoryStockPrices,
  manageCourierShipments,
  getCouriers,
  manageOrderReturns,
  getExternalStorages,
} from './tools';
import { orderEvents,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getOrders,
    createOrder,
    updateOrder,
    manageOrderProducts,
    addOrderPayment,
    getOrderStatuses,
    getInventories,
    getInventoryProducts,
    manageInventoryProducts,
    updateInventoryStockPrices,
    manageCourierShipments,
    getCouriers,
    manageOrderReturns,
    getExternalStorages,
  ],
  triggers: [
    inboundWebhook,
    orderEvents,
  ],
});
