import { Slate } from 'slates';
import { spec } from './spec';
import {
  listRepositoriesTool,
  getRepositoryTool,
  createRepositoryTool,
  updateRepositoryTool,
  deleteRepositoryTool,
  forkRepositoryTool,
  listPullRequestsTool,
  getPullRequestTool,
  createPullRequestTool,
  managePullRequestTool,
  commentOnPullRequestTool,
  listIssuesTool,
  createIssueTool,
  updateIssueTool,
  commentOnIssueTool,
  manageBranchesTool,
  manageTagsTool,
  listCommitsTool,
  managePipelinesTool,
  browseSourceTool,
  searchCodeTool,
  listWorkspaceMembersTool,
  manageProjectsTool,
  createCommitStatusTool
} from './tools';
import {
  repositoryEventsTrigger,
  pullRequestEventsTrigger,
  issueEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRepositoriesTool,
    getRepositoryTool,
    createRepositoryTool,
    updateRepositoryTool,
    deleteRepositoryTool,
    forkRepositoryTool,
    listPullRequestsTool,
    getPullRequestTool,
    createPullRequestTool,
    managePullRequestTool,
    commentOnPullRequestTool,
    listIssuesTool,
    createIssueTool,
    updateIssueTool,
    commentOnIssueTool,
    manageBranchesTool,
    manageTagsTool,
    listCommitsTool,
    managePipelinesTool,
    browseSourceTool,
    searchCodeTool,
    listWorkspaceMembersTool,
    manageProjectsTool,
    createCommitStatusTool
  ],
  triggers: [repositoryEventsTrigger, pullRequestEventsTrigger, issueEventsTrigger]
});
