import { Slate } from 'slates';
import { spec } from './spec';
import {
  calculateRoute,
  optimizeRoutes,
  calculateMatrix,
  geocode,
  calculateIsochrone,
  matchGpsTrace,
  clusterLocations,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    calculateRoute,
    optimizeRoutes,
    calculateMatrix,
    geocode,
    calculateIsochrone,
    matchGpsTrace,
    clusterLocations,
  ],
  triggers: [
    inboundWebhook,
  ],
});
