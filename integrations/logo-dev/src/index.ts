import { Slate } from 'slates';
import { spec } from './spec';
import { getLogoUrl, searchBrands, describeBrand } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [getLogoUrl, searchBrands, describeBrand],
  triggers: [inboundWebhook]
});
