import { Slate } from 'slates';
import { spec } from './spec';
import {
  getCityAirQuality,
  getNearestAirQuality,
  getStationAirQuality,
  listLocations,
  getCityRanking
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getCityAirQuality,
    getNearestAirQuality,
    getStationAirQuality,
    listLocations,
    getCityRanking
  ],
  triggers: [inboundWebhook]
});
