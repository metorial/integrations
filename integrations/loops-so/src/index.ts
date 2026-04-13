import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  updateContact,
  findContact,
  deleteContact,
  sendEvent,
  sendTransactionalEmail,
  listMailingLists,
  listContactProperties,
  listTransactionalEmails
} from './tools';
import { contactEvents, emailSendingEvents, emailEngagementEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    updateContact,
    findContact,
    deleteContact,
    sendEvent,
    sendTransactionalEmail,
    listMailingLists,
    listContactProperties,
    listTransactionalEmails
  ],
  triggers: [contactEvents, emailSendingEvents, emailEngagementEvents]
});
