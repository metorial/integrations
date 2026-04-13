import { Slate } from 'slates';
import { spec } from './spec';
import {
  autoHashtag,
  hashtagSuggestions,
  hashtagStats,
  trendingHashtags,
  hashtagHistory,
  bannedInstagramHashtags,
  emailInsights,
  companyInsights,
  emojiSuggestions,
  generateImage,
  animateImage,
  extractContent,
  shortenLink,
  listLinkCtas,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    autoHashtag,
    hashtagSuggestions,
    hashtagStats,
    trendingHashtags,
    hashtagHistory,
    bannedInstagramHashtags,
    emailInsights,
    companyInsights,
    emojiSuggestions,
    generateImage,
    animateImage,
    extractContent,
    shortenLink,
    listLinkCtas,
  ],
  triggers: [
    inboundWebhook,
  ],
});
