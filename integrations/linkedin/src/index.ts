import { Slate } from 'slates';
import { spec } from './spec';
import { getProfile, createPost, initializeImageUpload } from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [getProfile, createPost, initializeImageUpload],
  triggers: [inboundWebhook]
});
