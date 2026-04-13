import { Slate } from 'slates';
import { spec } from './spec';
import {
  getWeatherTool,
  getMarineDataTool,
  getTideDataTool,
  listTideStationsTool,
  getAstronomyDataTool,
  getSolarDataTool,
  getElevationTool,
  getBioDataTool
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getWeatherTool,
    getMarineDataTool,
    getTideDataTool,
    listTideStationsTool,
    getAstronomyDataTool,
    getSolarDataTool,
    getElevationTool,
    getBioDataTool
  ],
  triggers: [inboundWebhook]
});
