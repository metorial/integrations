import { Slate } from 'slates';
import { spec } from './spec';
import {
  createProduct,
  getProduct,
  deleteProduct,
  listProducts,
  listWorkspaces
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [createProduct, getProduct, deleteProduct, listProducts, listWorkspaces],
  triggers: [inboundWebhook]
});
