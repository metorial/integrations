import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  getOrder,
  updateOrder,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  listCategories,
  manageCategory,
  updateInventory
} from './tools';
import { orderEvents, productEvents, customerEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    listOrders,
    getOrder,
    updateOrder,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    listCategories,
    manageCategory,
    updateInventory
  ],
  triggers: [orderEvents, productEvents, customerEvents]
});
