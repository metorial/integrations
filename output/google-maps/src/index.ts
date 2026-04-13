import { Slate } from 'slates';
import { spec } from './spec';
import {
  geocodeTool,
  validateAddressTool,
  searchPlacesTool,
  getPlaceDetailsTool,
  getDirectionsTool,
  computeRouteMatrixTool,
  getElevationTool,
  getTimezoneTool,
  getAirQualityTool,
  snapToRoadsTool,
  generateStaticMapTool,
  geolocateTool,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    geocodeTool,
    validateAddressTool,
    searchPlacesTool,
    getPlaceDetailsTool,
    getDirectionsTool,
    computeRouteMatrixTool,
    getElevationTool,
    getTimezoneTool,
    getAirQualityTool,
    snapToRoadsTool,
    generateStaticMapTool,
    geolocateTool,
  ],
  triggers: [
    inboundWebhook,
  ],
});
