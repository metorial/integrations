import { Slate } from 'slates';
import { spec } from './spec';
import {
  listProjectsTool,
  getWorkItemTool,
  createWorkItemTool,
  updateWorkItemTool,
  deleteWorkItemTool,
  queryWorkItemsTool,
  manageRepositoryTool,
  managePullRequestTool,
  listPipelinesTool,
  runPipelineTool,
  getPipelineRunTool,
  listBuildsTool,
  manageWikiTool,
} from './tools';
import {
  workItemEventsTrigger,
  codeEventsTrigger,
  pullRequestEventsTrigger,
  buildCompleteEventsTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listProjectsTool,
    getWorkItemTool,
    createWorkItemTool,
    updateWorkItemTool,
    deleteWorkItemTool,
    queryWorkItemsTool,
    manageRepositoryTool,
    managePullRequestTool,
    listPipelinesTool,
    runPipelineTool,
    getPipelineRunTool,
    listBuildsTool,
    manageWikiTool,
  ],
  triggers: [
    workItemEventsTrigger,
    codeEventsTrigger,
    pullRequestEventsTrigger,
    buildCompleteEventsTrigger,
  ],
});
