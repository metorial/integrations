import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  sendTemplateMessage,
  listContacts,
  manageContact,
  getMessages,
  listTemplates,
  manageConversation,
  listCampaigns,
  listChannels,
  startChatbot,
} from './tools';
import {
  messageReceived,
  messageStatus,
  templateLifecycle,
  accountEvent,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    sendTemplateMessage,
    listContacts,
    manageContact,
    getMessages,
    listTemplates,
    manageConversation,
    listCampaigns,
    listChannels,
    startChatbot,
  ],
  triggers: [
    messageReceived,
    messageStatus,
    templateLifecycle,
    accountEvent,
  ],
});
