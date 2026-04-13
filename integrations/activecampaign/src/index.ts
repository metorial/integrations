import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrUpdateContact,
  getContact,
  searchContacts,
  deleteContact,
  manageContactTags,
  manageListSubscription,
  manageContactAutomation,
  createOrUpdateDeal,
  getDeal,
  searchDeals,
  deleteDeal,
  manageTags,
  manageLists,
  listCampaigns,
  listAutomations,
  createOrUpdateAccount,
  searchAccounts,
  createNote,
  createOrUpdateTask,
  listPipelinesAndStages,
  listCustomFields
} from './tools';
import { contactEvents, dealEvents, campaignEvents, smsEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createOrUpdateContact,
    getContact,
    searchContacts,
    deleteContact,
    manageContactTags,
    manageListSubscription,
    manageContactAutomation,
    createOrUpdateDeal,
    getDeal,
    searchDeals,
    deleteDeal,
    manageTags,
    manageLists,
    listCampaigns,
    listAutomations,
    createOrUpdateAccount,
    searchAccounts,
    createNote,
    createOrUpdateTask,
    listPipelinesAndStages,
    listCustomFields
  ],
  triggers: [contactEvents, dealEvents, campaignEvents, smsEvents]
});
