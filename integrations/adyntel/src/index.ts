import { Slate } from 'slates';
import { spec } from './spec';
import {
  lookupMetaAds,
  searchMetaAds,
  lookupLinkedInAds,
  lookupGoogleAds,
  lookupGoogleShoppingAds,
  searchTikTokAds,
  getTikTokAdDetails,
  analyzeKeywords
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    lookupMetaAds,
    searchMetaAds,
    lookupLinkedInAds,
    lookupGoogleAds,
    lookupGoogleShoppingAds,
    searchTikTokAds,
    getTikTokAdDetails,
    analyzeKeywords
  ],
  triggers: [inboundWebhook]
});
