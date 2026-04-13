import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchTickers,
  getTickerDetails,
  getAggregateBars,
  getDailyOpenClose,
  getSnapshot,
  getTradesQuotes,
  getTechnicalIndicator,
  getStockFinancials,
  getDividendsSplits,
  getOptionsChain,
  getTickerNews,
  getMarketStatus
} from './tools';
import { newTickerNews, stockPriceChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchTickers,
    getTickerDetails,
    getAggregateBars,
    getDailyOpenClose,
    getSnapshot,
    getTradesQuotes,
    getTechnicalIndicator,
    getStockFinancials,
    getDividendsSplits,
    getOptionsChain,
    getTickerNews,
    getMarketStatus
  ],
  triggers: [inboundWebhook, newTickerNews, stockPriceChange]
});
