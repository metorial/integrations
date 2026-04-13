import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRadiationAndWeather,
  getRooftopPvPower,
  getAdvancedPvPower,
  getTmyData,
  getGridAggregations,
  managePvPowerSite,
  listPvPowerSites,
  getHorizonAngle
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getRadiationAndWeather,
    getRooftopPvPower,
    getAdvancedPvPower,
    getTmyData,
    getGridAggregations,
    managePvPowerSite,
    listPvPowerSites,
    getHorizonAngle
  ],
  triggers: [inboundWebhook]
});
