import { Slate } from 'slates';
import { spec } from './spec';
import {
  editImage,
  generateImage,
  generateBackground,
  generateFashionModel,
  generateVideo,
  manageStorage,
  getJobStatus
} from './tools';
import { asyncJobCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    editImage,
    generateImage,
    generateBackground,
    generateFashionModel,
    generateVideo,
    manageStorage,
    getJobStatus
  ],
  triggers: [asyncJobCompleted]
});
