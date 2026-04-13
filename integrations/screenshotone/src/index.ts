import { Slate } from 'slates';
import { spec } from './spec';
import {
  takeScreenshot,
  generatePdf,
  extractMetadata,
  getUsage,
  analyzeWithVision
} from './tools';
import { screenshotCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [takeScreenshot, generatePdf, extractMetadata, getUsage, analyzeWithVision],
  triggers: [screenshotCompleted]
});
