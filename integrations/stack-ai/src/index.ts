import { Slate } from 'slates';
import { spec } from './spec';
import {
  runFlow,
  flowFeedback,
  listDocuments,
  deleteDocument,
  listKnowledgeBases,
  getKnowledgeBase,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  syncKnowledgeBase,
  listKnowledgeBaseResources,
  deleteKnowledgeBaseResource,
  listConnections,
  getConnection,
  deleteConnection,
  browseConnectionResources,
  getProjectAnalytics,
  getOrganizationAnalytics,
  getStorageAnalytics,
  listConversations,
  manageConversation,
  listUserConversations,
  listFolders,
  manageFolder,
  listToolProviders,
  runAction
} from './tools';
import { flowRunTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    runFlow,
    flowFeedback,
    listDocuments,
    deleteDocument,
    listKnowledgeBases,
    getKnowledgeBase,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    syncKnowledgeBase,
    listKnowledgeBaseResources,
    deleteKnowledgeBaseResource,
    listConnections,
    getConnection,
    deleteConnection,
    browseConnectionResources,
    getProjectAnalytics,
    getOrganizationAnalytics,
    getStorageAnalytics,
    listConversations,
    manageConversation,
    listUserConversations,
    listFolders,
    manageFolder,
    listToolProviders,
    runAction
  ],
  triggers: [inboundWebhook, flowRunTrigger]
});
