import { Slate } from 'slates';
import { spec } from './spec';
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  createMessage,
  listMessages,
  createCustomer,
  updateCustomer,
  getCustomer,
  listCustomers,
  mergeCustomers,
  listTags,
  createTag,
  updateTag,
  deleteTag,
  manageTicketTags,
  listMacros,
  createMacro,
  updateMacro,
  deleteMacro,
  listRules,
  createRule,
  updateRule,
  deleteRule,
  searchGorgias,
  listUsers,
  getUser,
  getAccount,
  listSatisfactionSurveys
} from './tools';
import { ticketEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    createMessage,
    listMessages,
    createCustomer,
    updateCustomer,
    getCustomer,
    listCustomers,
    mergeCustomers,
    listTags,
    createTag,
    updateTag,
    deleteTag,
    manageTicketTags,
    listMacros,
    createMacro,
    updateMacro,
    deleteMacro,
    listRules,
    createRule,
    updateRule,
    deleteRule,
    searchGorgias,
    listUsers,
    getUser,
    getAccount,
    listSatisfactionSurveys
  ],
  triggers: [
    ticketEvents
  ]
});
