import { Slate } from 'slates';
import { spec } from './spec';
import {
  createSitemap,
  getSitemap,
  listSitemaps,
  updateSitemap,
  deleteSitemap,
  createScrapingJob,
  getScrapingJob,
  listScrapingJobs,
  deleteScrapingJob,
  downloadScrapedData,
  getDataQuality,
  getProblematicUrls,
  manageScheduler,
  getAccount
} from './tools';
import { scrapingJobCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createSitemap,
    getSitemap,
    listSitemaps,
    updateSitemap,
    deleteSitemap,
    createScrapingJob,
    getScrapingJob,
    listScrapingJobs,
    deleteScrapingJob,
    downloadScrapedData,
    getDataQuality,
    getProblematicUrls,
    manageScheduler,
    getAccount
  ],
  triggers: [scrapingJobCompleted]
});
