import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRepositories,
  createRepository,
  updateRepository,
  deleteRepository,
  listBranches,
  createBranch,
  deleteBranch,
  listPullRequests,
  getPullRequest,
  createPullRequest,
  updatePullRequest,
  commentOnPullRequest,
  listCommits,
  getFileContent,
  searchCode
} from './tools';
import { codePush, pullRequestEvent, repositoryEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRepositories,
    createRepository,
    updateRepository,
    deleteRepository,
    listBranches,
    createBranch,
    deleteBranch,
    listPullRequests,
    getPullRequest,
    createPullRequest,
    updatePullRequest,
    commentOnPullRequest,
    listCommits,
    getFileContent,
    searchCode
  ],
  triggers: [codePush, pullRequestEvent, repositoryEvent]
});
