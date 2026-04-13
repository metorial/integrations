import { Slate } from 'slates';
import { spec } from './spec';
import {
  getAggregateBars,
  getStockSnapshot,
  getStockTradesAndQuotes,
  getStockMovers,
  getPreviousClose,
  getOptionsChain,
  getForexData,
  getCryptoData,
  getTechnicalIndicators,
  getTickerDetails,
  searchTickers,
  getMarketNews,
  getMarketStatus,
  getStockFinancials,
  getSplitsDividends,
  getUnifiedSnapshot
} from './tools';
import { newMarketNews, stockPriceChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAggregateBars,
    getStockSnapshot,
    getStockTradesAndQuotes,
    getStockMovers,
    getPreviousClose,
    getOptionsChain,
    getForexData,
    getCryptoData,
    getTechnicalIndicators,
    getTickerDetails,
    searchTickers,
    getMarketNews,
    getMarketStatus,
    getStockFinancials,
    getSplitsDividends,
    getUnifiedSnapshot
  ],
  triggers: [inboundWebhook, newMarketNews, stockPriceChange]
});
