import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  generateVideo,
  transcribeAudio,
  generateSpeech,
  searchModels,
  submitQueueRequest,
  checkQueueStatus,
  uploadFile,
  runModel
} from './tools';
import { queueCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    generateVideo,
    transcribeAudio,
    generateSpeech,
    searchModels,
    submitQueueRequest,
    checkQueueStatus,
    uploadFile,
    runModel
  ],
  triggers: [queueCompleted]
});
