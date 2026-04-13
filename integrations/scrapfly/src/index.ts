import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeWebpage,
  captureScreenshot,
  extractData,
  startCrawl,
  getCrawlStatus,
  getCrawlResults,
  getAccountInfo
} from './tools';
import {
  scrapeCompleted,
  screenshotCompleted,
  extractionCompleted,
  crawlerEvent
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    scrapeWebpage,
    captureScreenshot,
    extractData,
    startCrawl,
    getCrawlStatus,
    getCrawlResults,
    getAccountInfo
  ],
  triggers: [scrapeCompleted, screenshotCompleted, extractionCompleted, crawlerEvent]
});
