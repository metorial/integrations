import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCalls,
  getCall,
  manageCall,
  listUsers,
  getUser,
  manageUser,
  startCall,
  listContacts,
  manageContact,
  listNumbers,
  manageTeam,
  listTags,
  sendMessage,
  createInsightCard
} from './tools';
import {
  callEvents,
  userEvents,
  contactEvents,
  numberEvents,
  messageEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCalls,
    getCall,
    manageCall,
    listUsers,
    getUser,
    manageUser,
    startCall,
    listContacts,
    manageContact,
    listNumbers,
    manageTeam,
    listTags,
    sendMessage,
    createInsightCard
  ],
  triggers: [
    callEvents,
    userEvents,
    contactEvents,
    numberEvents,
    messageEvents
  ]
});
