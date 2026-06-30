import { Slate } from 'slates';
import { spec } from './spec';
import {
  getPurchaseOrder,
  getReleasedProduct,
  getSalesOrder,
  listInventoryOnHand,
  listProducts,
  listPurchaseOrderLines,
  listPurchaseOrders,
  listReceipts,
  listReleasedProducts,
  listSalesOrderLines,
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
    listPurchaseOrderLines,
    getPurchaseOrder,
    listSalesOrders,
    listSalesOrderLines,
    getSalesOrder,
    listShipments,
    listReceipts
  ],
  triggers: []
});
