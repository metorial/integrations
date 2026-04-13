import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  mergeTickets,
  sendRatingRequest,
  getReport,
  queryAuditLog,
  manageRules,
  manageMacros,
  manageAgents,
  manageTeams,
  manageTags,
  manageCannedResponses,
  manageCustomFields,
} from './tools';
import { ticketEventsTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    mergeTickets,
    sendRatingRequest,
    getReport,
    queryAuditLog,
    manageRules,
    manageMacros,
    manageAgents,
    manageTeams,
    manageTags,
    manageCannedResponses,
    manageCustomFields,
  ],
  triggers: [
    ticketEventsTrigger,
  ],
});
