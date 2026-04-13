import { Slate } from 'slates';
import { spec } from './spec';
import {
  generatePdf,
  generatePdfAsync,
  generateImage,
  mergePdfs,
  addWatermark,
  addTextToPdf,
  fillPdfFields,
  getPdfInfo,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createEditorSession,
  getAccountInfo,
  listTransactions
} from './tools';
import { pdfGenerationCompleted, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generatePdf,
    generatePdfAsync,
    generateImage,
    mergePdfs,
    addWatermark,
    addTextToPdf,
    fillPdfFields,
    getPdfInfo,
    listTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createEditorSession,
    getAccountInfo,
    listTransactions
  ],
  triggers: [inboundWebhook, pdfGenerationCompleted]
});
