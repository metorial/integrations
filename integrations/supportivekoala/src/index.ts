import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  getImage,
  listImages,
  createTemplate,
  updateTemplate,
  getTemplate,
  listTemplates
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    getImage,
    listImages,
    createTemplate,
    updateTemplate,
    getTemplate,
    listTemplates
  ],
  triggers: [inboundWebhook]
});
