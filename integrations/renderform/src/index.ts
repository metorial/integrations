import { Slate } from 'slates';
import { spec } from './spec';
import { renderImage, takeScreenshot, listTemplates, getTemplate, listResults } from './tools';
import { renderformEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [renderImage, takeScreenshot, listTemplates, getTemplate, listResults],
  triggers: [renderformEvents]
});
