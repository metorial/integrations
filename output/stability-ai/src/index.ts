import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  editImage,
  upscaleImage,
  controlImage,
  replaceBackground,
  generateAudio,
  generate3D,
  getAccount,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    editImage,
    upscaleImage,
    controlImage,
    replaceBackground,
    generateAudio,
    generate3D,
    getAccount,
  ],
  triggers: [
    inboundWebhook,
  ],
});
