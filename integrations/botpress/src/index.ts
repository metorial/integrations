import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listBotsTool,
  manageBotTool,
  manageConversationTool,
  sendMessageTool,
  listMessagesTool,
  manageUserTool,
  manageTableTool,
  manageTableRowsTool,
  manageFilesTool,
  createEventTool,
  manageStateTool,
  getBotAnalyticsTool,
  getBotLogsTool,
  listBotIssuesTool,
  listIntegrationsTool,
} from './tools';
import {
  incomingEventTrigger,
  newMessageTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBotsTool,
    manageBotTool,
    manageConversationTool,
    sendMessageTool,
    listMessagesTool,
    manageUserTool,
    manageTableTool,
    manageTableRowsTool,
    manageFilesTool,
    createEventTool,
    manageStateTool,
    getBotAnalyticsTool,
    getBotLogsTool,
    listBotIssuesTool,
    listIntegrationsTool,
  ],
  triggers: [
    inboundWebhook,
    incomingEventTrigger,
    newMessageTrigger,
  ],
});
