import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listAgents,
  createAgent,
  getAgent,
  updateAgent,
  deleteAgent,
  cloneAgent,
  sendMessage,
  listConversations,
  manageConversation,
  getMessages,
  analyzeMessage,
  manageSources,
  manageDocuments,
  manageSettings,
  manageLabels,
  getReports,
  getCitation,
  getAccountInfo,
} from './tools';
import {
  newConversation,
  newMessage,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAgents,
    createAgent,
    getAgent,
    updateAgent,
    deleteAgent,
    cloneAgent,
    sendMessage,
    listConversations,
    manageConversation,
    getMessages,
    analyzeMessage,
    manageSources,
    manageDocuments,
    manageSettings,
    manageLabels,
    getReports,
    getCitation,
    getAccountInfo,
  ],
  triggers: [
    inboundWebhook,
    newConversation,
    newMessage,
  ],
});
