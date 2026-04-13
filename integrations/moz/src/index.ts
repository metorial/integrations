import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getUrlMetricsTool,
  getLinksTool,
  getAnchorTextTool,
  getLinkingDomainsTool,
  getTopPagesTool,
  getGlobalTopTool,
  getKeywordMetricsTool,
  getKeywordSuggestionsTool,
  getSearchIntentTool,
  getSiteMetricsTool,
  getRankingKeywordsTool,
  findLinkIntersectTool,
  checkLinkStatusTool,
  getUsageAndIndexTool,
} from './tools';
import { indexUpdatedTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUrlMetricsTool,
    getLinksTool,
    getAnchorTextTool,
    getLinkingDomainsTool,
    getTopPagesTool,
    getGlobalTopTool,
    getKeywordMetricsTool,
    getKeywordSuggestionsTool,
    getSearchIntentTool,
    getSiteMetricsTool,
    getRankingKeywordsTool,
    findLinkIntersectTool,
    checkLinkStatusTool,
    getUsageAndIndexTool,
  ],
  triggers: [
    inboundWebhook,
    indexUpdatedTrigger,
  ],
});
