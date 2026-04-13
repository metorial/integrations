import { Slate } from 'slates';
import { spec } from './spec';
import {
  listBrands,
  getBrand,
  createOrUpdateBrand,
  listContacts,
  getContact,
  upsertContact,
  deleteContact,
  listLists,
  manageList,
  listFields,
  createField,
  listSenders,
  manageSender,
  sendTransactionalEmail,
  createBulkCampaign,
  listBulkCampaigns
} from './tools';
import { emailEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listBrands,
    getBrand,
    createOrUpdateBrand,
    listContacts,
    getContact,
    upsertContact,
    deleteContact,
    listLists,
    manageList,
    listFields,
    createField,
    listSenders,
    manageSender,
    sendTransactionalEmail,
    createBulkCampaign,
    listBulkCampaigns
  ],
  triggers: [
    emailEvents
  ]
});
