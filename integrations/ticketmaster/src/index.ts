import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchEventsTool,
  getEventDetailsTool,
  searchAttractionsTool,
  getAttractionDetailsTool,
  searchVenuesTool,
  getVenueDetailsTool,
  getEventOffersTool,
  checkInventoryStatusTool,
  browseClassificationsTool,
  suggestSearchTool
} from './tools';
import { newEventsTrigger, eventStatusChangesTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchEventsTool,
    getEventDetailsTool,
    searchAttractionsTool,
    getAttractionDetailsTool,
    searchVenuesTool,
    getVenueDetailsTool,
    getEventOffersTool,
    checkInventoryStatusTool,
    browseClassificationsTool,
    suggestSearchTool
  ],
  triggers: [inboundWebhook, newEventsTrigger, eventStatusChangesTrigger]
});
