import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRealTimeDepartures,
  planTrip,
  getFare,
  getStationInfo,
  getRouteInfo,
  getServiceAdvisories,
  getSystemStatus,
  getSchedule,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getRealTimeDepartures,
    planTrip,
    getFare,
    getStationInfo,
    getRouteInfo,
    getServiceAdvisories,
    getSystemStatus,
    getSchedule,
  ],
  triggers: [
    inboundWebhook,
  ],
});
