import { Slate } from 'slates';
import { spec } from './spec';
import {
  convertFile,
  convertFileAsync,
  getAsyncJobResult,
  mergePdf,
  splitPdf,
  compressPdf,
  protectPdf,
  decryptPdf,
  extractText,
  watermarkPdf,
  getAccountInfo,
  listSupportedConversions,
  uploadFile,
  deleteFile,
  pdfToPdfa
} from './tools';
import { asyncConversionComplete } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    convertFile,
    convertFileAsync,
    getAsyncJobResult,
    mergePdf,
    splitPdf,
    compressPdf,
    protectPdf,
    decryptPdf,
    extractText,
    watermarkPdf,
    getAccountInfo,
    listSupportedConversions,
    uploadFile,
    deleteFile,
    pdfToPdfa
  ],
  triggers: [asyncConversionComplete]
});
