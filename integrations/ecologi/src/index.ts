import { Slate } from 'slates';
import { spec } from './spec';
import { purchaseTreesTool, purchaseCarbonOffsetsTool, getImpactTool } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [purchaseTreesTool, purchaseCarbonOffsetsTool, getImpactTool],
  triggers: [
    inboundWebhook,
  ],
});
