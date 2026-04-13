import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  createVariations,
  upscaleImage,
  blendImages,
  describeImage,
  fetchTask
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    createVariations,
    upscaleImage,
    blendImages,
    describeImage,
    fetchTask
  ],
  triggers: [inboundWebhook]
});
