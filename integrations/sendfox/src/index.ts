import { Slate } from 'slates';
import { spec } from './spec';
import {
  createContact,
  getContact,
  listContacts,
  updateContact,
  deleteContact,
  unsubscribeContact,
  batchImportContacts,
  createList,
  listLists,
  getList,
  deleteList,
  manageListContacts,
  createCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  listAutomations,
  getAutomation,
  listForms,
  getAccount
} from './tools';
import { newContact, newCampaign, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createContact,
    getContact,
    listContacts,
    updateContact,
    deleteContact,
    unsubscribeContact,
    batchImportContacts,
    createList,
    listLists,
    getList,
    deleteList,
    manageListContacts,
    createCampaign,
    getCampaign,
    listCampaigns,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    listAutomations,
    getAutomation,
    listForms,
    getAccount
  ],
  triggers: [inboundWebhook, newContact, newCampaign]
});
