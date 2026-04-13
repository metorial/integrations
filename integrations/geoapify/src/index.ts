import { Slate } from 'slates';
import { spec } from './spec';
import {
  geocodeAddress,
  reverseGeocode,
  autocompleteAddress,
  calculateRoute,
  searchPlaces,
  getPlaceDetails,
  calculateIsoline,
  calculateRouteMatrix,
  ipGeolocation,
  lookupBoundaries,
  lookupPostcodes,
  mapMatch,
  batchGeocode,
  checkBatchGeocode
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    geocodeAddress,
    reverseGeocode,
    autocompleteAddress,
    calculateRoute,
    searchPlaces,
    getPlaceDetails,
    calculateIsoline,
    calculateRouteMatrix,
    ipGeolocation,
    lookupBoundaries,
    lookupPostcodes,
    mapMatch,
    batchGeocode,
    checkBatchGeocode
  ],
  triggers: [inboundWebhook]
});
