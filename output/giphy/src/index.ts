import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchGifs,
  trendingContent,
  translateToGif,
  randomGif,
  getGifs,
  animatedEmoji,
  searchSuggestions,
  uploadGif,
  searchChannels,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchGifs,
    trendingContent,
    translateToGif,
    randomGif,
    getGifs,
    animatedEmoji,
    searchSuggestions,
    uploadGif,
    searchChannels,
  ],
  triggers: [
    inboundWebhook,
  ],
});
