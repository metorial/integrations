import { Slate } from 'slates';
import { spec } from './spec';
import {
  identifyUser,
  trackEvent,
  trackTransaction,
  trackPageview,
  searchPeople,
  getPerson,
  deletePerson,
  getRealtimeAnalytics,
  getHistoricalAnalytics,
  listChats,
  getChatMessages,
  sendChatMessage,
  addChatNote,
  archiveChatConversation,
  listSmartGroups,
  getSmartGroupMembers,
  createSmartGroup,
} from './tools';
import { gosquaredEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    identifyUser,
    trackEvent,
    trackTransaction,
    trackPageview,
    searchPeople,
    getPerson,
    deletePerson,
    getRealtimeAnalytics,
    getHistoricalAnalytics,
    listChats,
    getChatMessages,
    sendChatMessage,
    addChatNote,
    archiveChatConversation,
    listSmartGroups,
    getSmartGroupMembers,
    createSmartGroup,
  ],
  triggers: [
    gosquaredEvents,
  ],
});
