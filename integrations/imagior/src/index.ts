import { Slate } from 'slates';
import { spec } from './spec';
import { generateImage, listTemplates, getTemplateElements, getAccount } from './tools';
import { newTemplateCreated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [generateImage, listTemplates, getTemplateElements, getAccount],
  triggers: [inboundWebhook, newTemplateCreated]
});
