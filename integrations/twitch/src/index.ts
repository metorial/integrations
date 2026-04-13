import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getUserInfo,
  getChannelInfo,
  updateChannel,
  getStreams,
  sendChatMessage,
  manageModeration,
  getFollowersSubscribers,
  manageClips,
  managePolls,
  managePredictions,
  manageChannelPoints,
  manageChatSettings,
  manageRaids,
  search,
  manageRoles,
  startCommercial,
  sendShoutout,
  getVideos,
} from './tools';
import {
  streamStatus,
  newFollower,
  channelUpdate,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserInfo,
    getChannelInfo,
    updateChannel,
    getStreams,
    sendChatMessage,
    manageModeration,
    getFollowersSubscribers,
    manageClips,
    managePolls,
    managePredictions,
    manageChannelPoints,
    manageChatSettings,
    manageRaids,
    search,
    manageRoles,
    startCommercial,
    sendShoutout,
    getVideos,
  ],
  triggers: [
    inboundWebhook,
    streamStatus,
    newFollower,
    channelUpdate,
  ],
});
