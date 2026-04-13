import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getHistoricalPrices,
  getIntradayPrices,
  getLivePrices,
  getFundamentals,
  searchInstruments,
  getFinancialNews,
  getSentiment,
  screenStocks,
  getTechnicalIndicators,
  getFinancialCalendar,
  getInsiderTransactions,
  getOptionsChain,
  getMacroIndicators,
  getDividendsSplits,
  getExchangeInfo,
  getBulkEod
} from './tools';
import {
  newFinancialNews,
  earningsEvent,
  insiderTransactionAlert,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getHistoricalPrices,
    getIntradayPrices,
    getLivePrices,
    getFundamentals,
    searchInstruments,
    getFinancialNews,
    getSentiment,
    screenStocks,
    getTechnicalIndicators,
    getFinancialCalendar,
    getInsiderTransactions,
    getOptionsChain,
    getMacroIndicators,
    getDividendsSplits,
    getExchangeInfo,
    getBulkEod
  ],
  triggers: [
    inboundWebhook,
    newFinancialNews,
    earningsEvent,
    insiderTransactionAlert
  ]
});
