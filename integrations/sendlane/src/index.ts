import { Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  getContact,
  addContactToList,
  removeContactFromList,
  unsubscribeContact,
  listLists,
  listListContacts,
  listTags,
  manageContactTags,
  listCampaigns,
  listCustomFields,
  updateContactCustomFields,
  listSenders,
  updateSmsConsent,
  manageSuppression,
  trackOrder,
  trackCheckout,
  trackOrderFulfilled,
  trackCustomEvent
} from './tools';
import { newContact, newUnsubscribe, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    getContact,
    addContactToList,
    removeContactFromList,
    unsubscribeContact,
    listLists,
    listListContacts,
    listTags,
    manageContactTags,
    listCampaigns,
    listCustomFields,
    updateContactCustomFields,
    listSenders,
    updateSmsConsent,
    manageSuppression,
    trackOrder,
    trackCheckout,
    trackOrderFulfilled,
    trackCustomEvent
  ],
  triggers: [inboundWebhook, newContact, newUnsubscribe]
});
