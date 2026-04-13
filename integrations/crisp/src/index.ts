import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  removeConversation,
  sendMessage,
  getMessages,
  listPeople,
  getPerson,
  createPerson,
  updatePerson,
  removePerson,
  manageHelpdeskArticle,
  listHelpdeskArticles,
  listOperators,
  getWebsiteAvailability,
  batchConversationActions,
  manageWebsiteSettings
} from './tools';
import {
  newConversation,
  conversationStateChanged,
  newMessage,
  peopleProfileChanged,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listConversations,
    getConversation,
    createConversation,
    updateConversation,
    removeConversation,
    sendMessage,
    getMessages,
    listPeople,
    getPerson,
    createPerson,
    updatePerson,
    removePerson,
    manageHelpdeskArticle,
    listHelpdeskArticles,
    listOperators,
    getWebsiteAvailability,
    batchConversationActions,
    manageWebsiteSettings
  ],
  triggers: [
    inboundWebhook,
    newConversation,
    conversationStateChanged,
    newMessage,
    peopleProfileChanged
  ]
});
