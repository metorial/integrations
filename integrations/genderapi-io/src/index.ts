import { Slate } from 'slates';
import { spec } from './spec';
import { detectGender, detectGenderBulk, validatePhone, checkUsage } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [detectGender, detectGenderBulk, validatePhone, checkUsage],
  triggers: [inboundWebhook]
});
