import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConversations,
  getConversation,
  sendMessage,
  createCustomChannelMessage,
  createPost,
  manageConversation,
  manageContacts,
  listContacts,
  listContactBooks,
  manageSharedLabels,
  manageTeams,
  manageTasks,
  listTasks,
  manageResponses,
  createAnalyticsReport,
  listOrganizationsAndUsers
} from './tools';
import { incomingMessage, newComment } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConversations,
    getConversation,
    sendMessage,
    createCustomChannelMessage,
    createPost,
    manageConversation,
    manageContacts,
    listContacts,
    listContactBooks,
    manageSharedLabels,
    manageTeams,
    manageTasks,
    listTasks,
    manageResponses,
    createAnalyticsReport,
    listOrganizationsAndUsers
  ],
  triggers: [incomingMessage, newComment]
});
