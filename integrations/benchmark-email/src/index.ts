import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign,
  getCampaignReport,
  listContactLists,
  manageContactList,
  listContacts,
  manageContact
} from './tools';
import { contactListEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    getCampaignReport,
    listContactLists,
    manageContactList,
    listContacts,
    manageContact
  ],
  triggers: [contactListEvents]
});
