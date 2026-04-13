import { Slate } from 'slates';
import { spec } from './spec';
import {
  webSearchTool,
  imageSearchTool,
  newsSearchTool,
  videoSearchTool,
  shoppingSearchTool,
  mapsSearchTool,
  flightsSearchTool,
  scholarSearchTool,
  trendsSearchTool,
  jobsSearchTool,
  autocompleteTool,
  locationsLookupTool,
  accountInfoTool
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    webSearchTool,
    imageSearchTool,
    newsSearchTool,
    videoSearchTool,
    shoppingSearchTool,
    mapsSearchTool,
    flightsSearchTool,
    scholarSearchTool,
    trendsSearchTool,
    jobsSearchTool,
    autocompleteTool,
    locationsLookupTool,
    accountInfoTool
  ],
  triggers: [inboundWebhook]
});
