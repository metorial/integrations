import { Slate } from 'slates';
import { spec } from './spec';
import {
  googleSearch,
  googleNews,
  googleMapsSearch,
  googleShopping,
  googleScholar,
  googleImages,
  googleVideos,
  googleFinance,
  googleAutocomplete,
  googleJobs,
  youtubeSearch,
  bingSearch,
  amazonSearch,
  walmartProduct,
  yelpSearch,
  linkedinJobs,
  webScraper,
  accountInfo,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    googleSearch,
    googleNews,
    googleMapsSearch,
    googleShopping,
    googleScholar,
    googleImages,
    googleVideos,
    googleFinance,
    googleAutocomplete,
    googleJobs,
    youtubeSearch,
    bingSearch,
    amazonSearch,
    walmartProduct,
    yelpSearch,
    linkedinJobs,
    webScraper,
    accountInfo,
  ],
  triggers: [
    inboundWebhook,
  ],
});
