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
  manageOrderShipment,
  listCustomers,
  manageCustomer,
  manageCart,
  manageCategory,
  manageBrand,
  manageCoupon,
  managePage,
  getStoreInformation,
  manageSubscriber,
  listChannels,
  managePriceList
} from './tools';
import {
  orderEvents,
  productEvents,
  customerEvents,
  cartEvents,
  shipmentEvents,
  inventoryEvents
} from './triggers';

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
    manageOrderShipment,
    listCustomers,
    manageCustomer,
    manageCart,
    manageCategory,
    manageBrand,
    manageCoupon,
    managePage,
    getStoreInformation,
    manageSubscriber,
    listChannels,
    managePriceList
  ],
  triggers: [
    orderEvents,
    productEvents,
    customerEvents,
    cartEvents,
    shipmentEvents,
    inventoryEvents
  ]
});
