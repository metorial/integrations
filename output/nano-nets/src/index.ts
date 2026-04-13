import { Slate } from 'slates';
import { spec } from './spec';
import {
  createModel,
  getModel,
  extractDocumentData,
  getPredictionResults,
  listProcessedFiles,
  reviewFile,
  trainModel,
  uploadTrainingData,
  classifyImage,
  detectObjects,
  extractFullText,
  retryFileProcessing
} from './tools';
import { documentProcessed } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createModel,
    getModel,
    extractDocumentData,
    getPredictionResults,
    listProcessedFiles,
    reviewFile,
    trainModel,
    uploadTrainingData,
    classifyImage,
    detectObjects,
    extractFullText,
    retryFileProcessing
  ],
  triggers: [
    documentProcessed
  ]
});
