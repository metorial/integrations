import { Slate } from 'slates';
import { spec } from './spec';
import {
  listWorkspacesTool,
  getWorkspaceTool,
  manageWorkspaceTool,
  listCollectionsTool,
  getCollectionTool,
  manageCollectionTool,
  forkCollectionTool,
  managePullRequestTool,
  listEnvironmentsTool,
  getEnvironmentTool,
  manageEnvironmentTool,
  manageMockServerTool,
  manageMonitorTool,
  runMonitorTool,
  manageApiTool,
  manageCommentTool,
  getUserTool,
  manageTagsTool,
  createWebhookTool
} from './tools';
import {
  collectionUpdatedTrigger,
  monitorRunCompletedTrigger,
  workspaceUpdatedTrigger,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listWorkspacesTool,
    getWorkspaceTool,
    manageWorkspaceTool,
    listCollectionsTool,
    getCollectionTool,
    manageCollectionTool,
    forkCollectionTool,
    managePullRequestTool,
    listEnvironmentsTool,
    getEnvironmentTool,
    manageEnvironmentTool,
    manageMockServerTool,
    manageMonitorTool,
    runMonitorTool,
    manageApiTool,
    manageCommentTool,
    getUserTool,
    manageTagsTool,
    createWebhookTool
  ],
  triggers: [
    inboundWebhook,
    collectionUpdatedTrigger,
    monitorRunCompletedTrigger,
    workspaceUpdatedTrigger
  ]
});
