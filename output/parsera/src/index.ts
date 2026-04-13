import { Slate } from 'slates';
import { spec } from './spec';
import {
  extractDataTool,
  parseContentTool,
  extractMarkdownTool,
  createScraperTool,
  runScraperTool,
  listScrapersTool,
  deleteScraperTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    extractDataTool,
    parseContentTool,
    extractMarkdownTool,
    createScraperTool,
    runScraperTool,
    listScrapersTool,
    deleteScraperTool,
  ],
  triggers: [
    inboundWebhook,
  ],
});
