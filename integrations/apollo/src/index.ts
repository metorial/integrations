import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchPeople,
  searchOrganizations,
  enrichPerson,
  searchContacts,
  createContact,
  updateContact,
  searchAccounts,
  createAccount,
  updateAccount,
  listDeals,
  getDeal,
  createDeal,
  updateDeal,
  searchSequences,
  addContactsToSequence,
  updateContactSequenceStatus,
  searchTasks,
  createTask,
  listUsers,
  listStages
} from './tools';
import { contactChanges, dealChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchPeople,
    searchOrganizations,
    enrichPerson,
    searchContacts,
    createContact,
    updateContact,
    searchAccounts,
    createAccount,
    updateAccount,
    listDeals,
    getDeal,
    createDeal,
    updateDeal,
    searchSequences,
    addContactsToSequence,
    updateContactSequenceStatus,
    searchTasks,
    createTask,
    listUsers,
    listStages
  ],
  triggers: [inboundWebhook, contactChanges, dealChanges]
});
