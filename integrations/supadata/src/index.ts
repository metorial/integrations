import { Slate } from 'slates';
import { spec } from './spec';
import {
  getTranscript,
  getTranscriptJobResult,
  getMediaMetadata,
  extractStructuredData,
  getExtractionJobResult,
  scrapeWebPage,
  mapWebsite,
  crawlWebsite,
  getCrawlJobResult,
  searchYouTube,
  getYouTubeChannel,
  getYouTubePlaylist,
  getYouTubeVideo,
  translateYouTubeTranscript
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getTranscript,
    getTranscriptJobResult,
    getMediaMetadata,
    extractStructuredData,
    getExtractionJobResult,
    scrapeWebPage,
    mapWebsite,
    crawlWebsite,
    getCrawlJobResult,
    searchYouTube,
    getYouTubeChannel,
    getYouTubePlaylist,
    getYouTubeVideo,
    translateYouTubeTranscript
  ],
  triggers: [inboundWebhook]
});
