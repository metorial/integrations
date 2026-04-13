import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getStockPrice,
  getStockAggregates,
  getStockSnapshot,
  getForexPrice,
  getForexAggregates,
  convertCurrency,
  getCryptoPrice,
  getCryptoAggregates,
  getFinancialStatements,
  getMarketNews,
  getMarketMovers,
  searchMarket,
  getMarketStatus,
  getTechnicalIndicator,
  getSectorPerformance,
  getEconomicCalendar,
  getStockSignals,
} from './tools';
import { newMarketNews,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getStockPrice,
    getStockAggregates,
    getStockSnapshot,
    getForexPrice,
    getForexAggregates,
    convertCurrency,
    getCryptoPrice,
    getCryptoAggregates,
    getFinancialStatements,
    getMarketNews,
    getMarketMovers,
    searchMarket,
    getMarketStatus,
    getTechnicalIndicator,
    getSectorPerformance,
    getEconomicCalendar,
    getStockSignals,
  ],
  triggers: [
    inboundWebhook,
    newMarketNews,
  ],
});
