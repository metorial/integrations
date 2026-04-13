import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrders,
  getOrder,
  createOrder,
  fulfillOrder,
  listProducts,
  getProduct,
  manageProduct,
  manageInventory,
  listProfiles,
  getProfile,
  listTransactions,
  getSiteInfo,
  listStorePages
} from './tools';
import {
  orderEvents,
  extensionEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrders,
    getOrder,
    createOrder,
    fulfillOrder,
    listProducts,
    getProduct,
    manageProduct,
    manageInventory,
    listProfiles,
    getProfile,
    listTransactions,
    getSiteInfo,
    listStorePages
  ],
  triggers: [
    orderEvents,
    extensionEvents
  ]
});
