import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeWebpage,
  takeScreenshot,
  googleSearch,
  amazonProduct,
  amazonSearch,
  createAsyncJob,
  getAsyncJob,
  getAccountStats,
} from './tools';
import { scrapeResult } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    scrapeWebpage,
    takeScreenshot,
    googleSearch,
    amazonProduct,
    amazonSearch,
    createAsyncJob,
    getAsyncJob,
    getAccountStats,
  ],
  triggers: [
    scrapeResult,
  ],
});
