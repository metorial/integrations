import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchEvents,
  searchPerformers,
  searchVenues,
  getTaxonomies,
  getRecommendations,
  getEventDetails,
  getPerformerDetails
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchEvents,
    searchPerformers,
    searchVenues,
    getTaxonomies,
    getRecommendations,
    getEventDetails,
    getPerformerDetails
  ],
  triggers: [inboundWebhook]
});
