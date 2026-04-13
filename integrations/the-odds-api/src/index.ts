import { Slate } from 'slates';
import { spec } from './spec';
import {
  listSportsTool,
  getOddsTool,
  getScoresTool,
  getEventsTool,
  getEventOddsTool,
  getEventMarketsTool,
  getParticipantsTool,
  getHistoricalOddsTool,
  getHistoricalEventsTool
} from './tools';
import { scoreUpdatesTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listSportsTool,
    getOddsTool,
    getScoresTool,
    getEventsTool,
    getEventOddsTool,
    getEventMarketsTool,
    getParticipantsTool,
    getHistoricalOddsTool,
    getHistoricalEventsTool
  ],
  triggers: [inboundWebhook, scoreUpdatesTrigger]
});
