import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTickets,
  getTicket,
  searchTickets,
  createTicket,
  updateTicketStatus,
  replyToTicket,
  listReplies,
  addComment,
  listComments,
  assignTicket,
  manageLabels,
  listAgents,
  manageSnippets,
  getReports
} from './tools';
import {
  ticketEvents,
  replyCommentEvents,
  assignmentEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTickets,
    getTicket,
    searchTickets,
    createTicket,
    updateTicketStatus,
    replyToTicket,
    listReplies,
    addComment,
    listComments,
    assignTicket,
    manageLabels,
    listAgents,
    manageSnippets,
    getReports
  ],
  triggers: [
    ticketEvents,
    replyCommentEvents,
    assignmentEvents
  ]
});
