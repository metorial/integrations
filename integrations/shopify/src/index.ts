import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  manageVariants,
  listOrders,
  getOrder,
  manageOrder,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  manageInventory,
  listLocations,
  createFulfillment,
  manageCollections,
  manageDiscounts,
  manageDraftOrders,
  getShop,
  managePages,
  manageMetafields
} from './tools';
import {
  orderEvents,
  productEvents,
  customerEvents,
  inventoryEvents,
  fulfillmentEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    manageVariants,
    listOrders,
    getOrder,
    manageOrder,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    manageInventory,
    listLocations,
    createFulfillment,
    manageCollections,
    manageDiscounts,
    manageDraftOrders,
    getShop,
    managePages,
    manageMetafields
  ],
  triggers: [orderEvents, productEvents, customerEvents, inventoryEvents, fulfillmentEvents]
});
