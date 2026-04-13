import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  manageProductVariations,
  manageProductCategories,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  manageOrderNotes,
  createRefund,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  manageCoupons,
  getSalesReport,
  manageShippingZones,
  manageTaxRates,
  getStoreSettings,
  updateStoreSetting,
  managePaymentGateways,
  getSystemStatus
} from './tools';
import { orderEvents, productEvents, customerEvents, couponEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    manageProductVariations,
    manageProductCategories,
    listOrders,
    getOrder,
    createOrder,
    updateOrder,
    manageOrderNotes,
    createRefund,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    manageCoupons,
    getSalesReport,
    manageShippingZones,
    manageTaxRates,
    getStoreSettings,
    updateStoreSetting,
    managePaymentGateways,
    getSystemStatus
  ],
  triggers: [orderEvents, productEvents, customerEvents, couponEvents]
});
