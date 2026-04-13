import { Slate } from 'slates';
import { spec } from './spec';
import {
  listStorefronts,
  getStorefront,
  listProducts,
  getProduct,
  listPurchases,
  getPurchase,
  reactivatePurchase,
  listCustomers,
  getCustomer,
  listSubscribers,
  getSubscriber,
  verifySubscriber,
  verifyNotification,
} from './tools';
import { purchaseNotification } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listStorefronts,
    getStorefront,
    listProducts,
    getProduct,
    listPurchases,
    getPurchase,
    reactivatePurchase,
    listCustomers,
    getCustomer,
    listSubscribers,
    getSubscriber,
    verifySubscriber,
    verifyNotification,
  ],
  triggers: [
    purchaseNotification,
  ],
});
