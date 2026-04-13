import { Slate } from 'slates';
import { spec } from './spec';
import {
  scrapeWebpage,
  batchScrape,
  crawlWebsite,
  extractData,
  webSearch,
  createSession,
  getSession,
  stopSession,
  listSessions,
  createProfile,
  listProfiles,
  deleteProfile,
  runBrowserAgent,
  getSessionRecording
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    scrapeWebpage,
    batchScrape,
    crawlWebsite,
    extractData,
    webSearch,
    createSession,
    getSession,
    stopSession,
    listSessions,
    createProfile,
    listProfiles,
    deleteProfile,
    runBrowserAgent,
    getSessionRecording
  ],
  triggers: [inboundWebhook]
});
