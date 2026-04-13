import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateText,
  createResponse,
  generateImage,
  createEmbeddings,
  moderateContent,
  listModels,
  createFineTuningJob,
  getFineTuningJob,
  cancelFineTuningJob,
  listFiles,
  getFile,
  deleteFile,
  createVectorStore,
  listVectorStores,
  searchVectorStore,
  deleteVectorStore,
  createBatch,
  getBatch,
  cancelBatch
} from './tools';
import { openaiEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateText,
    createResponse,
    generateImage,
    createEmbeddings,
    moderateContent,
    listModels,
    createFineTuningJob,
    getFineTuningJob,
    cancelFineTuningJob,
    listFiles,
    getFile,
    deleteFile,
    createVectorStore,
    listVectorStores,
    searchVectorStore,
    deleteVectorStore,
    createBatch,
    getBatch,
    cancelBatch
  ],
  triggers: [openaiEvents]
});
