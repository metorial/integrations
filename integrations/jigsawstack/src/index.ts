import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeWeb,
  webSearch,
  analyzeSentiment,
  translateText,
  summarizeText,
  extractFromImage,
  transcribeAudio,
  generateImage,
  textToSql,
  validateContent,
  detectNsfw,
  detectObjects,
  convertHtml,
  predictTimeSeries,
  generateEmbedding,
  geoSearch,
  getFile,
  deleteFile,
} from './tools';
import { taskCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    scrapeWeb,
    webSearch,
    analyzeSentiment,
    translateText,
    summarizeText,
    extractFromImage,
    transcribeAudio,
    generateImage,
    textToSql,
    validateContent,
    detectNsfw,
    detectObjects,
    convertHtml,
    predictTimeSeries,
    generateEmbedding,
    geoSearch,
    getFile,
    deleteFile,
  ],
  triggers: [
    taskCompleted,
  ],
});
