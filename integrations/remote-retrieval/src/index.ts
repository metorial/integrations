import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrder,
  listOrders,
  getOrderDetails,
  getCompanyDetails,
  getDevicePrices
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [createOrder, listOrders, getOrderDetails, getCompanyDetails, getDevicePrices],
  triggers: [inboundWebhook]
});
