import { Slate } from 'slates';
import { spec } from './spec';
import {
  generatePdf,
  captureScreenshot,
  convertDocument,
  mergePdfs,
  extractPdfPages,
  protectPdf,
  watermarkPdf,
  generateBarcode,
  generateThumbnail,
  extractPdfData,
  createZip,
  convertToMarkdown,
  deleteFile,
  checkBalance,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    generatePdf,
    captureScreenshot,
    convertDocument,
    mergePdfs,
    extractPdfPages,
    protectPdf,
    watermarkPdf,
    generateBarcode,
    generateThumbnail,
    extractPdfData,
    createZip,
    convertToMarkdown,
    deleteFile,
    checkBalance,
  ],
  triggers: [
    inboundWebhook,
  ],
});
