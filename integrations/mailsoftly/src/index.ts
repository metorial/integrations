import { Slate } from 'slates';
import { spec } from './spec';
import {
  createOrUpdateContact,
  getContacts,
  searchContacts,
  manageContactLists,
  manageContactListMembers,
  manageTags,
  createEmailCampaign,
  getEmailCampaigns,
  sendEmail,
  getContactFields,
  addCustomFieldToContact
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    createOrUpdateContact,
    getContacts,
    searchContacts,
    manageContactLists,
    manageContactListMembers,
    manageTags,
    createEmailCampaign,
    getEmailCampaigns,
    sendEmail,
    getContactFields,
    addCustomFieldToContact
  ],
  triggers: [inboundWebhook]
});
