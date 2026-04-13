import { Slate } from 'slates';
import { spec } from './spec';
import {
  getStockPrice,
  getExchangeRate,
  getCommodityPrice,
  getCryptoPrice,
  getWeather,
  getAirQuality,
  geocodeLocation,
  analyzeSentiment,
  compareTextSimilarity,
  lookupWord,
  getNutrition,
  searchExercises,
  getQuotes,
  getTrivia,
  getHistoricalEvents,
  lookupAnimal,
  lookupIp,
  lookupDomain,
  validateContact,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    getStockPrice,
    getExchangeRate,
    getCommodityPrice,
    getCryptoPrice,
    getWeather,
    getAirQuality,
    geocodeLocation,
    analyzeSentiment,
    compareTextSimilarity,
    lookupWord,
    getNutrition,
    searchExercises,
    getQuotes,
    getTrivia,
    getHistoricalEvents,
    lookupAnimal,
    lookupIp,
    lookupDomain,
    validateContact,
  ],
  triggers: [
    inboundWebhook,
  ],
});
