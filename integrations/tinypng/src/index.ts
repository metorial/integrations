import { Slate } from 'slates';
import { spec } from './spec';
import {
  compressImage,
  resizeImage,
  convertImage,
  saveToCloud,
  getCompressionCount
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [compressImage, resizeImage, convertImage, saveToCloud, getCompressionCount],
  triggers: [inboundWebhook]
});
