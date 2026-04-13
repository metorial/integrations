import { Slate } from 'slates';
import { spec } from './spec';
import {
  analyzeDomain,
  getBacklinks,
  getReferringDomains,
  getOrganicKeywords,
  getTopPages,
  getAnchors,
  getOrganicCompetitors,
  getDomainHistory,
  researchKeywords,
  getKeywordIdeas,
  getSerpOverview,
  getRankTrackerData,
  getSiteAudit,
  getBrandRadar,
  batchAnalyze,
  manageRankTracker,
  getLinkedDomains,
  getMetricsByCountry,
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    analyzeDomain,
    getBacklinks,
    getReferringDomains,
    getOrganicKeywords,
    getTopPages,
    getAnchors,
    getOrganicCompetitors,
    getDomainHistory,
    researchKeywords,
    getKeywordIdeas,
    getSerpOverview,
    getRankTrackerData,
    getSiteAudit,
    getBrandRadar,
    batchAnalyze,
    manageRankTracker,
    getLinkedDomains,
    getMetricsByCountry,
  ],
  triggers: [
    inboundWebhook,
  ]
});
