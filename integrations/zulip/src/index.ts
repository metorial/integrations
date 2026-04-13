import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  manageReactions,
  manageMessageFlags,
  listChannels,
  createChannel,
  updateChannel,
  archiveChannel,
  getChannelTopics,
  manageSubscriptions,
  listUsers,
  getUser,
  setUserStatus,
  getUserPresence,
  manageUserGroups,
  sendInvitation
} from './tools';
import { messageEvents, channelEvents, reactionEvents, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    getMessages,
    updateMessage,
    deleteMessage,
    manageReactions,
    manageMessageFlags,
    listChannels,
    createChannel,
    updateChannel,
    archiveChannel,
    getChannelTopics,
    manageSubscriptions,
    listUsers,
    getUser,
    setUserStatus,
    getUserPresence,
    manageUserGroups,
    sendInvitation
  ],
  triggers: [inboundWebhook, messageEvents, channelEvents, reactionEvents]
});
