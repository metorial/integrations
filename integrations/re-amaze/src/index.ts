import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  addMessage,
  listContacts,
  createContact,
  updateContact,
  listContactNotes,
  createContactNote,
  deleteContactNote,
  listArticles,
  createArticle,
  updateArticle,
  listIncidents,
  createIncident,
  updateIncident,
  getReport,
  listChannels,
  listResponseTemplates,
  createResponseTemplate,
  updateResponseTemplate,
  listStaff,
  createStaff,
  listSatisfactionRatings,
  listSystems
} from './tools';
import {
  newConversations,
  updatedConversations,
  newContacts,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConversations,
    getConversation,
    createConversation,
    updateConversation,
    addMessage,
    listContacts,
    createContact,
    updateContact,
    listContactNotes,
    createContactNote,
    deleteContactNote,
    listArticles,
    createArticle,
    updateArticle,
    listIncidents,
    createIncident,
    updateIncident,
    getReport,
    listChannels,
    listResponseTemplates,
    createResponseTemplate,
    updateResponseTemplate,
    listStaff,
    createStaff,
    listSatisfactionRatings,
    listSystems
  ],
  triggers: [inboundWebhook, newConversations, updatedConversations, newContacts]
});
