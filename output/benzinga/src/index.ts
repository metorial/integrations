import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchNewsTool,
  getCalendarEventsTool,
  getMarketMoversTool,
  getCompanyFundamentalsTool,
  getQuotesTool,
  getHistoricalBarsTool,
  getCorporateLogosTool,
  getOptionsActivityTool,
  getGovernmentTradesTool,
  getInsiderTransactionsTool,
  getShortInterestTool,
  getWiimsTool,
} from './tools';
import { newsWebhookTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchNewsTool,
    getCalendarEventsTool,
    getMarketMoversTool,
    getCompanyFundamentalsTool,
    getQuotesTool,
    getHistoricalBarsTool,
    getCorporateLogosTool,
    getOptionsActivityTool,
    getGovernmentTradesTool,
    getInsiderTransactionsTool,
    getShortInterestTool,
    getWiimsTool,
  ],
  triggers: [
    newsWebhookTrigger,
  ],
});
