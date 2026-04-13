import { Slate } from 'slates';
import { spec } from './spec';
import {
  generateImage,
  searchImages,
  buyImage,
  getDownloadHistory,
  getGeneration,
  listGenerations,
  updateGeneration,
  retryGeneration,
  deleteGenerations,
  getCredits
} from './tools';
import { generationStatus } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    generateImage,
    searchImages,
    buyImage,
    getDownloadHistory,
    getGeneration,
    listGenerations,
    updateGeneration,
    retryGeneration,
    deleteGenerations,
    getCredits
  ],
  triggers: [generationStatus]
});
