import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProducts,
  getProduct,
  manageProduct,
  manageOfferCodes,
  manageVariants,
  manageCustomFields,
  listSales,
  getSale,
  manageSale,
  listSubscribers,
  getSubscriber,
  manageLicense,
  getUser,
} from './tools';
import {
  saleEvents,
  subscriptionEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProducts,
    getProduct,
    manageProduct,
    manageOfferCodes,
    manageVariants,
    manageCustomFields,
    listSales,
    getSale,
    manageSale,
    listSubscribers,
    getSubscriber,
    manageLicense,
    getUser,
  ],
  triggers: [
    saleEvents,
    subscriptionEvents,
  ]
});
