import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLists,
  listContacts,
  getContact,
  createContact,
  updateContact,
  unsubscribeContact,
  listEmails,
  listReports,
  listForms,
  getForm
} from './tools';
import { newContact, newEmail, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLists,
    listContacts,
    getContact,
    createContact,
    updateContact,
    unsubscribeContact,
    listEmails,
    listReports,
    listForms,
    getForm
  ],
  triggers: [inboundWebhook, newContact, newEmail]
});
