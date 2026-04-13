import { Slate } from 'slates';
import { spec } from './spec';
import {
  submitOrder,
  getOrderStatus,
  updateOrder,
  updateCustomer,
  getShippingOptions,
  validateAddress,
  getPrices,
  getProductDetails,
  browseCatalog,
  listImages,
  addImages,
  updateImages,
  deleteImages,
  browseFraming,
  listOrderStatusDefinitions
} from './tools';
import { orderStatusUpdate } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    submitOrder,
    getOrderStatus,
    updateOrder,
    updateCustomer,
    getShippingOptions,
    validateAddress,
    getPrices,
    getProductDetails,
    browseCatalog,
    listImages,
    addImages,
    updateImages,
    deleteImages,
    browseFraming,
    listOrderStatusDefinitions
  ],
  triggers: [orderStatusUpdate]
});
