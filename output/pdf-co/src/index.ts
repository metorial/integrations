import { Slate } from 'slates';
import { spec } from './spec';
import {
  convertPdf,
  generatePdf,
  mergePdf,
  splitPdf,
  editPdf,
  pdfSecurity,
  generateBarcode,
  readBarcode,
  parseInvoice,
  parseDocument,
  classifyDocument,
  getPdfInfo,
  searchPdfText,
  pdfOcr,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    convertPdf,
    generatePdf,
    mergePdf,
    splitPdf,
    editPdf,
    pdfSecurity,
    generateBarcode,
    readBarcode,
    parseInvoice,
    parseDocument,
    classifyDocument,
    getPdfInfo,
    searchPdfText,
    pdfOcr,
  ],
  triggers: [
    inboundWebhook,
  ],
});
