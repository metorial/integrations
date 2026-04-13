import { Slate } from 'slates';
import { spec } from './spec';
import {
  createUpdateContact,
  deleteContact,
  getContact,
  listContacts,
  manageContactTags,
  manageContactLists,
  sendMessage,
  sendTemplate,
  startAutomation,
  manageDeal,
  deleteDeal,
  listDeals,
  manageLists
} from './tools';
import { contactEvents, messageEvents, chatEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createUpdateContact,
    deleteContact,
    getContact,
    listContacts,
    manageContactTags,
    manageContactLists,
    sendMessage,
    sendTemplate,
    startAutomation,
    manageDeal,
    deleteDeal,
    listDeals,
    manageLists
  ],
  triggers: [contactEvents, messageEvents, chatEvents]
});
