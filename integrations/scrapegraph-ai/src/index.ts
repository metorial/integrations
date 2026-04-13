import { Slate } from 'slates';
import { spec } from './spec';
import { smartScrape, webSearch, crawlWebsite, markdownify, rawScrape, discoverSitemap, agenticScrape, getCredits, getRequestStatus } from './tools';
import { crawlCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    smartScrape,
    webSearch,
    crawlWebsite,
    markdownify,
    rawScrape,
    discoverSitemap,
    agenticScrape,
    getCredits,
    getRequestStatus,
  ],
  triggers: [
    crawlCompleted,
  ],
});
