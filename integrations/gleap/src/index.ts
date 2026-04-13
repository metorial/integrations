import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  listSessions,
  getSession,
  createSession,
  updateSession,
  getMessages,
  sendMessage,
  listCollections,
  manageCollection,
  listArticles,
  manageArticle,
  listEngagements,
  manageEngagement,
  manageTeam,
  manageAiContent
} from './tools';
import { feedbackWebhook, ticketUpdated } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    listSessions,
    getSession,
    createSession,
    updateSession,
    getMessages,
    sendMessage,
    listCollections,
    manageCollection,
    listArticles,
    manageArticle,
    listEngagements,
    manageEngagement,
    manageTeam,
    manageAiContent
  ],
  triggers: [feedbackWebhook, ticketUpdated]
});
