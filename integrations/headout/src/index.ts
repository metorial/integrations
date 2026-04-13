import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchProducts,
  getProduct,
  getInventory,
  createBooking,
  getBooking,
  listCities,
  listCategories,
  listCollections
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchProducts,
    getProduct,
    getInventory,
    createBooking,
    getBooking,
    listCities,
    listCategories,
    listCollections
  ],
  triggers: [inboundWebhook]
});
