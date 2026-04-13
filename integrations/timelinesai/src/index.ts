import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  getChats,
  getMessages,
  manageChat,
  listWhatsAppAccounts,
  manageFiles,
  getWorkspaceInfo,
  manageWebhooks,
  reactToMessage
} from './tools';
import { messageEvents, chatEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    getChats,
    getMessages,
    manageChat,
    listWhatsAppAccounts,
    manageFiles,
    getWorkspaceInfo,
    manageWebhooks,
    reactToMessage
  ],
  triggers: [messageEvents, chatEvents]
});
