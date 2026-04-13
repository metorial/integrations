import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  unlockWebPage,
  searchSerp,
  triggerScrapingJob,
  scrapeSynchronous,
  getScrapingJobStatus,
  downloadSnapshot,
  cancelScrapingJob,
  getSnapshotHistory,
  getAccountInfo,
  listZones,
  getZoneDetails,
  manageZone,
} from './tools';
import {
  scrapingJobCompleted,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    unlockWebPage,
    searchSerp,
    triggerScrapingJob,
    scrapeSynchronous,
    getScrapingJobStatus,
    downloadSnapshot,
    cancelScrapingJob,
    getSnapshotHistory,
    getAccountInfo,
    listZones,
    getZoneDetails,
    manageZone,
  ],
  triggers: [
    inboundWebhook,
    scrapingJobCompleted,
  ],
});
