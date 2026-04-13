import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  generateImageFromTemplate,
  listImages,
  deleteImages,
  createTemplate,
  updateTemplate,
  listTemplates
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    generateImageFromTemplate,
    listImages,
    deleteImages,
    createTemplate,
    updateTemplate,
    listTemplates
  ],
  triggers: [
    inboundWebhook,
  ]
});
