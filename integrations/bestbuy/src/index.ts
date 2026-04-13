import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchProducts,
  getProduct,
  browseCategories,
  searchStores,
  checkAvailability,
  getRecommendations,
  getOpenBoxOffers
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchProducts,
    getProduct,
    browseCategories,
    searchStores,
    checkAvailability,
    getRecommendations,
    getOpenBoxOffers
  ],
  triggers: [inboundWebhook]
});
