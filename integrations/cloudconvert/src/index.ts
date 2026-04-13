import { Slate } from 'slates';
import { spec } from './spec';
import {
  convertFile,
  optimizeFile,
  addWatermark,
  captureWebsite,
  generateThumbnail,
  mergeFiles,
  extractMetadata,
  createArchive,
  processPdf,
  getJob,
  listJobs,
  listFormats,
  createJob
} from './tools';
import { jobEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    convertFile,
    optimizeFile,
    addWatermark,
    captureWebsite,
    generateThumbnail,
    mergeFiles,
    extractMetadata,
    createArchive,
    processPdf,
    getJob,
    listJobs,
    listFormats,
    createJob
  ],
  triggers: [jobEvent]
});
