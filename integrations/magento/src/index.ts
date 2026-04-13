import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageProduct,
  searchProducts,
  manageOrder,
  searchOrders,
  fulfillOrder,
  manageCustomer,
  searchCustomers,
  manageInventory,
  manageCart,
  manageCategory,
  manageCms,
  getStoreInfo
} from './tools';
import { newOrder, productChange, customerChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageProduct,
    searchProducts,
    manageOrder,
    searchOrders,
    fulfillOrder,
    manageCustomer,
    searchCustomers,
    manageInventory,
    manageCart,
    manageCategory,
    manageCms,
    getStoreInfo
  ],
  triggers: [inboundWebhook, newOrder, productChange, customerChange]
});
