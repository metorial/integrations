import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapePage,
  getPageContent,
  generatePdf,
  takeScreenshot,
  unblockPage,
  runPerformanceAudit,
  webSearch,
  runFunction
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    scrapePage,
    getPageContent,
    generatePdf,
    takeScreenshot,
    unblockPage,
    runPerformanceAudit,
    webSearch,
    runFunction
  ],
  triggers: [inboundWebhook]
});
