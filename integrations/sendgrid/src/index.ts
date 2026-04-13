import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendEmail,
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  upsertContacts,
  searchContacts,
  getContact,
  deleteContacts,
  listContactLists,
  createContactList,
  updateContactList,
  deleteContactList,
  removeContactFromList,
  listSuppressionGroups,
  createSuppressionGroup,
  addSuppressedEmails,
  removeSuppressedEmail,
  listSuppressions,
  getEmailStats,
  listVerifiedSenders,
  createVerifiedSender,
  deleteVerifiedSender,
  resendSenderVerification
} from './tools';
import { emailEvents, inboundEmail } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendEmail.build(),
    listTemplates.build(),
    getTemplate.build(),
    createTemplate.build(),
    updateTemplate.build(),
    deleteTemplate.build(),
    upsertContacts.build(),
    searchContacts.build(),
    getContact.build(),
    deleteContacts.build(),
    listContactLists.build(),
    createContactList.build(),
    updateContactList.build(),
    deleteContactList.build(),
    removeContactFromList.build(),
    listSuppressionGroups.build(),
    createSuppressionGroup.build(),
    addSuppressedEmails.build(),
    removeSuppressedEmail.build(),
    listSuppressions.build(),
    getEmailStats.build(),
    listVerifiedSenders.build(),
    createVerifiedSender.build(),
    deleteVerifiedSender.build(),
    resendSenderVerification.build()
  ],
  triggers: [emailEvents.build(), inboundEmail.build()]
});
