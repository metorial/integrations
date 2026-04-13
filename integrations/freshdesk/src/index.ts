import { Slate } from 'slates';
import { spec } from './spec';
import {
  createTicket,
  getTicket,
  updateTicket,
  listTickets,
  searchTickets,
  deleteTicket,
  addTicketReply,
  listConversations,
  createContact,
  getContact,
  updateContact,
  listContacts,
  searchContacts,
  createCompany,
  getCompany,
  updateCompany,
  listCompanies,
  listAgents,
  listGroups,
  listKnowledgeBase,
  getArticle,
  createArticle,
  listTimeEntries,
  createTimeEntry
} from './tools';
import { ticketEvents, contactEvents, ticketEventsWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createTicket,
    getTicket,
    updateTicket,
    listTickets,
    searchTickets,
    deleteTicket,
    addTicketReply,
    listConversations,
    createContact,
    getContact,
    updateContact,
    listContacts,
    searchContacts,
    createCompany,
    getCompany,
    updateCompany,
    listCompanies,
    listAgents,
    listGroups,
    listKnowledgeBase,
    getArticle,
    createArticle,
    listTimeEntries,
    createTimeEntry
  ],
  triggers: [ticketEvents, contactEvents, ticketEventsWebhook]
});
