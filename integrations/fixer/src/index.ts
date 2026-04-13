import { Slate } from 'slates';
import { spec } from './spec';
import {
  getExchangeRates,
  convertCurrency,
  getHistoricalRates,
  getTimeSeries,
  getFluctuation,
  listCurrencies
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getExchangeRates,
    convertCurrency,
    getHistoricalRates,
    getTimeSeries,
    getFluctuation,
    listCurrencies
  ],
  triggers: [inboundWebhook]
});
