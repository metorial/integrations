import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMailboxes,
  manageMailbox,
  listConversations,
  getConversation,
  deleteConversation,
  sendEmail,
  listMessages,
  manageContact,
  listContacts,
  searchContacts,
  manageNote,
  manageTag,
  listTeams,
  listUsers,
  manageTemplate,
  manageWebhook
} from './tools';
import { conversationEvents, messageEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMailboxes,
    manageMailbox,
    listConversations,
    getConversation,
    deleteConversation,
    sendEmail,
    listMessages,
    manageContact,
    listContacts,
    searchContacts,
    manageNote,
    manageTag,
    listTeams,
    listUsers,
    manageTemplate,
    manageWebhook
  ],
  triggers: [conversationEvents, messageEvents]
});
