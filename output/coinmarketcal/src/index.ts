import { Slate } from 'slates';
import { spec } from './spec';
import { searchEvents, listCoins, listCategories } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [searchEvents, listCoins, listCategories],
  triggers: [
    inboundWebhook,
  ],
});
