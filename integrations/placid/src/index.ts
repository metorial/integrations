import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  generatePdf,
  generateVideo,
  manageTemplates,
  manageCollections,
  uploadMedia,
  mergePdfs,
  getGenerationStatus
} from './tools';
import { generationCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    generatePdf,
    generateVideo,
    manageTemplates,
    manageCollections,
    uploadMedia,
    mergePdfs,
    getGenerationStatus
  ],
  triggers: [generationCompleted]
});
