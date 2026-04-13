import { Slate } from 'slates';
import { spec } from './spec';
import {
  executeJavascript,
  executePython,
  generatePdf,
  manipulatePdf,
  generateImage,
  scrapeWebsite,
  managePages,
  convertDocument,
  processData,
  checkSsl
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    executeJavascript,
    executePython,
    generatePdf,
    manipulatePdf,
    generateImage,
    scrapeWebsite,
    managePages,
    convertDocument,
    processData,
    checkSsl
  ],
  triggers: [inboundWebhook]
});
