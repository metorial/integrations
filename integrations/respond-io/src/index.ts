import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  getContact,
  updateContact,
  deleteContact,
  listContacts,
  mergeContacts,
  manageContactTags,
  sendMessage,
  sendTemplateMessage,
  listMessages,
  listMessageTemplates,
  manageConversation,
  assignConversation,
  addComment,
  listCustomFields,
  listWorkspaceResources,
} from './tools';
import {
  messageEvent,
  contactEvent,
  conversationEvent,
  commentEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    getContact,
    updateContact,
    deleteContact,
    listContacts,
    mergeContacts,
    manageContactTags,
    sendMessage,
    sendTemplateMessage,
    listMessages,
    listMessageTemplates,
    manageConversation,
    assignConversation,
    addComment,
    listCustomFields,
    listWorkspaceResources,
  ],
  triggers: [
    messageEvent,
    contactEvent,
    conversationEvent,
    commentEvent,
  ],
});
