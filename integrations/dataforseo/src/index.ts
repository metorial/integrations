import { Slate } from 'slates';
import { spec } from './spec';
import {
  backlinksAnalysis,
  contentAnalysis,
  domainAnalytics,
  domainCompetitors,
  domainIntersection,
  getTaskResult,
  googleShoppingSearch,
  keywordResearch,
  keywordSuggestions,
  keywordsForSite,
  onPageAudit,
  serpSearch
} from './tools';
import { taskCompleted } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    serpSearch,
    keywordResearch,
    keywordsForSite,
    keywordSuggestions,
    backlinksAnalysis,
    domainAnalytics,
    domainCompetitors,
    domainIntersection,
    onPageAudit,
    contentAnalysis,
    googleShoppingSearch,
    getTaskResult
  ],
  triggers: [taskCompleted]
});
