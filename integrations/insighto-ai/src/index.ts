import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAssistants,
  manageAssistant,
  listContacts,
  manageContact,
  listConversations,
  deleteConversation,
  makeCall,
  disconnectCall,
  sendMessage,
  listWidgets,
  listDataSources,
  manageDataSource,
  manageForm,
  listForms,
  manageWebhook,
  listWebhooks,
  manageCampaign
} from './tools';
import { newConversation, newContact, newFormSubmission, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAssistants,
    manageAssistant,
    listContacts,
    manageContact,
    listConversations,
    deleteConversation,
    makeCall,
    disconnectCall,
    sendMessage,
    listWidgets,
    listDataSources,
    manageDataSource,
    manageForm,
    listForms,
    manageWebhook,
    listWebhooks,
    manageCampaign
  ],
  triggers: [inboundWebhook, newConversation, newContact, newFormSubmission]
});
