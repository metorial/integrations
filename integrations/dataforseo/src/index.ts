import { Slate } from 'slates';
import { spec } from './spec';
import {
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
  getTaskResult,
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
    getTaskResult,
  ],
  triggers: [
    taskCompleted,
  ],
});
