import { Slate } from 'slates';
import { spec } from './spec';
import {
  getRepository,
  listRepositories,
  createRepository,
  updateRepository,
  starRepository,
  manageIssue,
  listIssues,
  getIssue,
  commentOnIssue,
  managePullRequest,
  listPullRequests,
  mergePullRequest,
  reviewPullRequest,
  search,
  manageFileContent,
  manageWorkflow,
  createRelease,
  listCommits,
  listBranches,
  manageLabels,
  manageGist,
  manageCollaborators,
  getUser,
  createCommitStatus
} from './tools';
import {
  pushTrigger,
  pullRequestTrigger,
  pullRequestReviewTrigger,
  issuesTrigger,
  issueCommentTrigger,
  workflowRunTrigger,
  releaseTrigger,
  starTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getRepository,
    listRepositories,
    createRepository,
    updateRepository,
    starRepository,
    manageIssue,
    listIssues,
    getIssue,
    commentOnIssue,
    managePullRequest,
    listPullRequests,
    mergePullRequest,
    reviewPullRequest,
    search,
    manageFileContent,
    manageWorkflow,
    createRelease,
    listCommits,
    listBranches,
    manageLabels,
    manageGist,
    manageCollaborators,
    getUser,
    createCommitStatus
  ],
  triggers: [
    pushTrigger,
    pullRequestTrigger,
    pullRequestReviewTrigger,
    issuesTrigger,
    issueCommentTrigger,
    workflowRunTrigger,
    releaseTrigger,
    starTrigger
  ]
});
