import { Slate } from 'slates';
import { spec } from './spec';
import {
  webSearch,
  newsSearch,
  imageSearch,
  videoSearch,
  shoppingSearch,
  scholarSearch,
  mapsSearch,
  trendsSearch,
  jobsSearch,
  youtubeSearch,
  autocomplete,
  lookupLocations,
  getAccount
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    webSearch,
    newsSearch,
    imageSearch,
    videoSearch,
    shoppingSearch,
    scholarSearch,
    mapsSearch,
    trendsSearch,
    jobsSearch,
    youtubeSearch,
    autocomplete,
    lookupLocations,
    getAccount
  ],
  triggers: [inboundWebhook]
});
