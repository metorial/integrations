import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjects,
  getProject,
  manageProject,
  listIssues,
  manageIssue,
  listMergeRequests,
  manageMergeRequest,
  listPipelines,
  managePipeline,
  getPipelineJobs,
  browseRepository,
  manageBranch,
  manageFile,
  addComment,
  search,
  createRelease,
  listGroups
} from './tools';
import {
  pushEvents,
  mergeRequestEvents,
  issueEvents,
  pipelineEvents,
  commentEvents,
  deploymentEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjects,
    getProject,
    manageProject,
    listIssues,
    manageIssue,
    listMergeRequests,
    manageMergeRequest,
    listPipelines,
    managePipeline,
    getPipelineJobs,
    browseRepository,
    manageBranch,
    manageFile,
    addComment,
    search,
    createRelease,
    listGroups
  ],
  triggers: [
    pushEvents,
    mergeRequestEvents,
    issueEvents,
    pipelineEvents,
    commentEvents,
    deploymentEvents
  ]
});
