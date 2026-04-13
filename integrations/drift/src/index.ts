import { Slate } from 'slates';
import { spec } from './spec';
import {
  getContact,
  createContact,
  updateContact,
  deleteContact,
  listConversations,
  getConversation,
  createConversation,
  sendMessage,
  listUsers,
  manageAccount,
  getBookedMeetings,
  listPlaybooks,
  listTeams,
} from './tools';
import {
  conversationEvent,
  contactEvent,
  meetingEvent,
  userEvent,
  playbookEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getContact,
    createContact,
    updateContact,
    deleteContact,
    listConversations,
    getConversation,
    createConversation,
    sendMessage,
    listUsers,
    manageAccount,
    getBookedMeetings,
    listPlaybooks,
    listTeams,
  ],
  triggers: [
    conversationEvent,
    contactEvent,
    meetingEvent,
    userEvent,
    playbookEvent,
  ],
});
