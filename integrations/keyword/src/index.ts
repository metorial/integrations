import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  manageProject,
  listKeywords,
  manageKeywords,
  getKeywordRankings,
  getKeywordMetrics,
  refreshKeywords,
  getProjectRegions,
  listAiDomains,
  getAiSearchTerms,
  getAiMetrics,
  getAiSentiment,
  getAiCitations
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    manageProject,
    listKeywords,
    manageKeywords,
    getKeywordRankings,
    getKeywordMetrics,
    refreshKeywords,
    getProjectRegions,
    listAiDomains,
    getAiSearchTerms,
    getAiMetrics,
    getAiSentiment,
    getAiCitations
  ],
  triggers: [inboundWebhook]
});
