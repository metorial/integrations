import { Slate } from 'slates';
import { spec } from './spec';
import {
  getEodPrices,
  getIntradayPrices,
  searchTickers,
  getTickerDetails,
  getSplitsAndDividends,
  listExchanges,
  getCommodities,
  getMarketIndices,
  getGovernmentBonds,
  getEtfHoldings,
  getAnalystRatings,
  searchSecFilings,
  getSecFinancialData,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getEodPrices,
    getIntradayPrices,
    searchTickers,
    getTickerDetails,
    getSplitsAndDividends,
    listExchanges,
    getCommodities,
    getMarketIndices,
    getGovernmentBonds,
    getEtfHoldings,
    getAnalystRatings,
    searchSecFilings,
    getSecFinancialData,
  ],
  triggers: [
    inboundWebhook,
  ],
});
