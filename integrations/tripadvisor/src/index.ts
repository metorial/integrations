import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchLocations,
  searchNearbyLocations,
  getLocationDetails,
  getLocationReviews,
  getLocationPhotos,
  mapLocation,
  sendReviewRequest,
  manageReviewRequest,
  checkReviewOptIn
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchLocations,
    searchNearbyLocations,
    getLocationDetails,
    getLocationReviews,
    getLocationPhotos,
    mapLocation,
    sendReviewRequest,
    manageReviewRequest,
    checkReviewOptIn
  ],
  triggers: [inboundWebhook]
});
