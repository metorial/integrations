import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchTokens,
  getTopTokens,
  getPriceData,
  getGrades,
  getTradingSignals,
  getMarketMetrics,
  getSentiment,
  getTechnicalAnalysis,
  getQuantMetrics,
  getPricePrediction,
  getAiReports,
  getIndices,
  getCryptoInvestors,
  askAiAgent
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchTokens,
    getTopTokens,
    getPriceData,
    getGrades,
    getTradingSignals,
    getMarketMetrics,
    getSentiment,
    getTechnicalAnalysis,
    getQuantMetrics,
    getPricePrediction,
    getAiReports,
    getIndices,
    getCryptoInvestors,
    askAiAgent
  ],
  triggers: [inboundWebhook]
});
