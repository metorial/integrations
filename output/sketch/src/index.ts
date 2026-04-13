import { Slate } from 'slates';
import { spec } from './spec';
import {
  parseDocumentTool,
  inspectLayersTool,
  extractColorsTool,
  extractTextContentTool,
  generatePageTool,
  generateDocumentTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    parseDocumentTool,
    inspectLayersTool,
    extractColorsTool,
    extractTextContentTool,
    generatePageTool,
    generateDocumentTool,
  ],
  triggers: [
    inboundWebhook,
  ],
});
