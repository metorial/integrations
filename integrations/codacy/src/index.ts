import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOrganizations,
  listRepositories,
  getRepositoryAnalysis,
  searchIssues,
  listPullRequests,
  getPullRequestAnalysis,
  addRepository,
  listFiles,
  searchSecurityItems,
  searchSbomDependencies,
  listRepositoryTools,
  configureAnalysisTool,
  manageDastTarget,
  listCodingStandards,
  listPeople,
  getCommitAnalysis,
  manageRepositoryToken
} from './tools';
import { newPullRequests, newSecurityItems, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOrganizations,
    listRepositories,
    getRepositoryAnalysis,
    searchIssues,
    listPullRequests,
    getPullRequestAnalysis,
    addRepository,
    listFiles,
    searchSecurityItems,
    searchSbomDependencies,
    listRepositoryTools,
    configureAnalysisTool,
    manageDastTarget,
    listCodingStandards,
    listPeople,
    getCommitAnalysis,
    manageRepositoryToken
  ],
  triggers: [inboundWebhook, newPullRequests, newSecurityItems]
});
