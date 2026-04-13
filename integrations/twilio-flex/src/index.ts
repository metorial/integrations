import { Slate } from 'slates';
import { spec } from './spec';
import {
  createInteractionTool,
  manageInteractionChannelTool,
  manageInteractionParticipantsTool,
  manageWorkersTool,
  manageTaskQueuesTool,
  manageTasksTool,
  manageWorkflowsTool,
  manageActivitiesTool,
  getFlexConfigurationTool,
  manageFlexFlowsTool,
  manageConversationsTool,
  manageConversationParticipantsTool,
  sendConversationMessageTool,
  listConversationMessagesTool,
  manageStudioFlowsTool,
  getWorkspaceStatisticsTool
} from './tools';
import {
  taskEventsTrigger,
  taskRouterWebhookTrigger,
  interactionWebhookTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createInteractionTool,
    manageInteractionChannelTool,
    manageInteractionParticipantsTool,
    manageWorkersTool,
    manageTaskQueuesTool,
    manageTasksTool,
    manageWorkflowsTool,
    manageActivitiesTool,
    getFlexConfigurationTool,
    manageFlexFlowsTool,
    manageConversationsTool,
    manageConversationParticipantsTool,
    sendConversationMessageTool,
    listConversationMessagesTool,
    manageStudioFlowsTool,
    getWorkspaceStatisticsTool
  ],
  triggers: [
    taskEventsTrigger,
    taskRouterWebhookTrigger,
    interactionWebhookTrigger
  ]
});
