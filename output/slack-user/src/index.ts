import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  updateMessage,
  scheduleMessage,
  getConversationHistory,
  listConversations,
  manageChannel,
  manageChannelMembers,
  getUserInfo,
  manageReactions,
  managePins,
  manageFiles,
  searchMessages,
  manageReminders,
  manageUserGroups,
  manageBookmarks,
  getTeamInfo
} from './tools';
import {
  newMessage,
  newMessageWebhook,
  channelActivity,
  newReaction,
  newFile,
  userChange
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    updateMessage,
    scheduleMessage,
    getConversationHistory,
    listConversations,
    manageChannel,
    manageChannelMembers,
    getUserInfo,
    manageReactions,
    managePins,
    manageFiles,
    searchMessages,
    manageReminders,
    manageUserGroups,
    manageBookmarks,
    getTeamInfo
  ],
  triggers: [newMessage, newMessageWebhook, channelActivity, newReaction, newFile, userChange]
});
