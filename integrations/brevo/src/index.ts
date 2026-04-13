import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendTransactionalEmail,
  sendTransactionalSms,
  createOrUpdateContact,
  getContact,
  updateContact,
  deleteContact,
  listContacts,
  listContactLists,
  createContactList,
  addContactsToList,
  removeContactsFromList,
  createDeal,
  getDeal,
  updateDeal,
  deleteDeal,
  listDeals,
  createEmailCampaign,
  getEmailCampaign,
  listEmailCampaigns,
  sendEmailCampaignNow,
  getAccount,
  listSenders,
  trackEvent
} from './tools';
import {
  transactionalEmailEvents,
  transactionalSmsEvents,
  marketingEvents,
  inboundEmailEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendTransactionalEmail.build(),
    sendTransactionalSms.build(),
    createOrUpdateContact.build(),
    getContact.build(),
    updateContact.build(),
    deleteContact.build(),
    listContacts.build(),
    listContactLists.build(),
    createContactList.build(),
    addContactsToList.build(),
    removeContactsFromList.build(),
    createDeal.build(),
    getDeal.build(),
    updateDeal.build(),
    deleteDeal.build(),
    listDeals.build(),
    createEmailCampaign.build(),
    getEmailCampaign.build(),
    listEmailCampaigns.build(),
    sendEmailCampaignNow.build(),
    getAccount.build(),
    listSenders.build(),
    trackEvent.build()
  ],
  triggers: [
    transactionalEmailEvents.build(),
    transactionalSmsEvents.build(),
    marketingEvents.build(),
    inboundEmailEvents.build()
  ]
});
