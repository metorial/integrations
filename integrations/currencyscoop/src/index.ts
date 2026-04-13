import { Slate } from 'slates';
import { spec } from './spec';
import {
  getExchangeRates,
  getHistoricalRates,
  convertCurrency,
  getTimeSeries,
  listCurrencies
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getExchangeRates,
    getHistoricalRates,
    convertCurrency,
    getTimeSeries,
    listCurrencies
  ],
  triggers: [inboundWebhook]
});
