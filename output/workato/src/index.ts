import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listRecipesTool,
  getRecipeTool,
  manageRecipeTool,
  startStopRecipeTool,
  getRecipeVersionsTool,
  listConnectionsTool,
  manageConnectionTool,
  listJobsTool,
  listProjectsTool,
  manageFolderTool,
  deployProjectTool,
  listDeploymentsTool,
  exportPackageTool,
  manageLookupTableTool,
  manageEventTopicTool,
  manageDataTableTool,
  manageEnvironmentPropertiesTool,
  manageApiEndpointsTool,
  getWorkspaceInfoTool,
} from './tools';
import {
  recipeChangesTrigger,
  newJobTrigger,
  eventStreamMessagesTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listRecipesTool.build(),
    getRecipeTool.build(),
    manageRecipeTool.build(),
    startStopRecipeTool.build(),
    getRecipeVersionsTool.build(),
    listConnectionsTool.build(),
    manageConnectionTool.build(),
    listJobsTool.build(),
    listProjectsTool.build(),
    manageFolderTool.build(),
    deployProjectTool.build(),
    listDeploymentsTool.build(),
    exportPackageTool.build(),
    manageLookupTableTool.build(),
    manageEventTopicTool.build(),
    manageDataTableTool.build(),
    manageEnvironmentPropertiesTool.build(),
    manageApiEndpointsTool.build(),
    getWorkspaceInfoTool.build(),
  ],
  triggers: [
    inboundWebhook,
    recipeChangesTrigger.build(),
    newJobTrigger.build(),
    eventStreamMessagesTrigger.build(),
  ],
});
