import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  getContact,
  updateContact,
  deleteContact,
  listContacts,
  searchContacts,
  createContactGroup,
  updateContactGroup,
  deleteContactGroup,
  listContactGroups,
  getContactGroup,
  modifyGroupMembers,
  listOtherContacts,
  searchOtherContacts,
  copyOtherContact,
  searchDirectory,
} from './tools';
import { contactChanged,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    getContact,
    updateContact,
    deleteContact,
    listContacts,
    searchContacts,
    createContactGroup,
    updateContactGroup,
    deleteContactGroup,
    listContactGroups,
    getContactGroup,
    modifyGroupMembers,
    listOtherContacts,
    searchOtherContacts,
    copyOtherContact,
    searchDirectory,
  ],
  triggers: [
    inboundWebhook,
    contactChanged,
  ],
});
