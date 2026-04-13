import { Slate } from 'slates';
import { spec } from './spec';
import {
  enhanceImage,
  removeBackground,
  generateImage,
  faceSwap,
  inpaintOutpaint,
  resizeImage,
  getJobResult,
  deleteJobResult,
  getAccountInfo
} from './tools';
import { jobCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    enhanceImage,
    removeBackground,
    generateImage,
    faceSwap,
    inpaintOutpaint,
    resizeImage,
    getJobResult,
    deleteJobResult,
    getAccountInfo
  ],
  triggers: [jobCompleted]
});
