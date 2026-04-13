import { Slate } from 'slates';
import { spec } from './spec';
import {
  webSearch,
  imageSearch,
  reverseImageSearch,
  newsSearch,
  shoppingSearch,
  shoppingProductDetails,
  mapsSearch,
  googleTrends,
  accountStatus,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    webSearch,
    imageSearch,
    reverseImageSearch,
    newsSearch,
    shoppingSearch,
    shoppingProductDetails,
    mapsSearch,
    googleTrends,
    accountStatus,
  ],
  triggers: [
    inboundWebhook,
  ],
});
