import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchSerp,
  scheduleSerp,
  checkSerpTask,
  getSerpResult,
  searchGoogleJobs,
  searchGoogleVideos,
  searchGoogleShortVideos,
  searchTrends,
  searchLocations,
  listLanguages,
  listDomains,
  getAccountInfo
} from './tools';
import { scheduledTaskCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchSerp,
    scheduleSerp,
    checkSerpTask,
    getSerpResult,
    searchGoogleJobs,
    searchGoogleVideos,
    searchGoogleShortVideos,
    searchTrends,
    searchLocations,
    listLanguages,
    listDomains,
    getAccountInfo
  ],
  triggers: [scheduledTaskCompleted]
});
