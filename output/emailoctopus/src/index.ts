import { Slate } from 'slates';
import { spec } from './spec';
import {
  listLists,
  getList,
  createList,
  updateList,
  deleteList,
  listContacts,
  getContact,
  createContact,
  updateContact,
  upsertContact,
  deleteContact,
  batchUpdateContacts,
  manageTags,
  manageFields,
  listCampaigns,
  getCampaign,
  getCampaignReport,
  triggerAutomation,
} from './tools';
import { contactEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listLists,
    getList,
    createList,
    updateList,
    deleteList,
    listContacts,
    getContact,
    createContact,
    updateContact,
    upsertContact,
    deleteContact,
    batchUpdateContacts,
    manageTags,
    manageFields,
    listCampaigns,
    getCampaign,
    getCampaignReport,
    triggerAutomation,
  ],
  triggers: [
    contactEvent,
  ],
});
