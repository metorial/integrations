import { Slate } from 'slates';
import { spec } from './spec';
import {
  getPurchaseOrder,
  getReleasedProduct,
  getSalesOrder,
  listInventoryOnHand,
  listProducts,
  listPurchaseOrders,
  listReceipts,
  listReleasedProducts,
  listSalesOrders,
  listShipments,
  listWarehouses
} from './tools';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    listReleasedProducts,
    getReleasedProduct,
    listInventoryOnHand,
    listWarehouses,
    listPurchaseOrders,
    getPurchaseOrder,
    listSalesOrders,
    getSalesOrder,
    listShipments,
    listReceipts
  ],
  triggers: []
});
