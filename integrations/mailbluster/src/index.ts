import { Slate } from 'slates';
import { spec } from './spec';
import {
  createLead,
  getLead,
  updateLead,
  deleteLead,
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrder,
  listOrders,
  updateOrder,
  deleteOrder,
  listFields,
  createField
} from './tools';
import { newProduct, newOrder, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createLead,
    getLead,
    updateLead,
    deleteLead,
    createProduct,
    getProduct,
    listProducts,
    updateProduct,
    deleteProduct,
    createOrder,
    getOrder,
    listOrders,
    updateOrder,
    deleteOrder,
    listFields,
    createField
  ],
  triggers: [inboundWebhook, newProduct, newOrder]
});
