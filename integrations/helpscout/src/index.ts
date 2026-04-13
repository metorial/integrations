import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  addThread,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  manageOrganization,
  listMailboxes,
  manageTags,
  listUsers,
  listTeams,
  manageWorkflow,
  getReport,
  listSatisfactionRatings,
  manageDocs
} from './tools';
import {
  conversationEvents,
  customerEvents,
  satisfactionEvents,
  organizationEvents,
  tagEvents,
  beaconChatEvents,
  userEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    addThread,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    manageOrganization,
    listMailboxes,
    manageTags,
    listUsers,
    listTeams,
    manageWorkflow,
    getReport,
    listSatisfactionRatings,
    manageDocs
  ],
  triggers: [
    conversationEvents,
    customerEvents,
    satisfactionEvents,
    organizationEvents,
    tagEvents,
    beaconChatEvents,
    userEvents
  ]
});
