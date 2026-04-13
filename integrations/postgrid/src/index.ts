import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  listContacts,
  sendLetter,
  sendPostcard,
  sendCheque,
  sendSelfMailer,
  getOrder,
  cancelOrder,
  createTemplate,
  listTemplates,
  verifyAddress,
  verifyInternationalAddress,
  autocompleteAddress,
  autocompleteInternationalAddress
} from './tools';
import { mailOrderEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    listContacts,
    sendLetter,
    sendPostcard,
    sendCheque,
    sendSelfMailer,
    getOrder,
    cancelOrder,
    createTemplate,
    listTemplates,
    verifyAddress,
    verifyInternationalAddress,
    autocompleteAddress,
    autocompleteInternationalAddress
  ],
  triggers: [mailOrderEvents]
});
