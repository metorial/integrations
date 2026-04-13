import { Slate } from 'slates';
import { spec } from './spec';
import {
  manageContacts,
  getContact,
  searchContacts,
  manageCompanies,
  getCompany,
  listCompanies,
  manageConversations,
  getConversation,
  searchConversations,
  manageTickets,
  manageArticles,
  searchArticles,
  manageTags,
  sendMessage,
  manageEvents,
  listAdmins,
  createNote
} from './tools';
import {
  contactEvents,
  conversationEvents,
  ticketEvents,
  companyEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    manageContacts,
    getContact,
    searchContacts,
    manageCompanies,
    getCompany,
    listCompanies,
    manageConversations,
    getConversation,
    searchConversations,
    manageTickets,
    manageArticles,
    searchArticles,
    manageTags,
    sendMessage,
    manageEvents,
    listAdmins,
    createNote
  ],
  triggers: [
    contactEvents,
    conversationEvents,
    ticketEvents,
    companyEvents
  ]
});
