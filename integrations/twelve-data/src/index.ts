import { Slate } from 'slates';
import { spec } from './spec';
import {
  getTimeSeries,
  getQuote,
  getPrice,
  searchSymbols,
  getExchangeRate,
  convertCurrency,
  getCompanyProfile,
  getFinancialStatements,
  getDividendsAndSplits,
  getTechnicalIndicator,
  getAnalystData,
  getEarnings,
  getEtfDetails,
  getMutualFundDetails,
  listExchanges
} from './tools';
import { priceChange, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getTimeSeries,
    getQuote,
    getPrice,
    searchSymbols,
    getExchangeRate,
    convertCurrency,
    getCompanyProfile,
    getFinancialStatements,
    getDividendsAndSplits,
    getTechnicalIndicator,
    getAnalystData,
    getEarnings,
    getEtfDetails,
    getMutualFundDetails,
    listExchanges
  ],
  triggers: [inboundWebhook, priceChange]
});
