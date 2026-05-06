import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPost,
  deletePost,
  getPost,
  searchPosts,
  getTimeline,
  getUser,
  manageLike,
  manageRetweet,
  manageBookmark,
  manageFollow,
  manageBlockMute,
  sendDirectMessage,
  deleteDirectMessage,
  getDirectMessages,
  manageList,
  manageReplyVisibility,
  uploadMedia
} from './tools';
import {
  newMention,
  newPostFromSearch,
  newFollower,
  newDirectMessage,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPost,
    deletePost,
    getPost,
    searchPosts,
    getTimeline,
    getUser,
    manageLike,
    manageRetweet,
    manageBookmark,
    manageFollow,
    manageBlockMute,
    sendDirectMessage,
    deleteDirectMessage,
    getDirectMessages,
    manageList,
    manageReplyVisibility,
    uploadMedia
  ],
  triggers: [inboundWebhook, newMention, newPostFromSearch, newFollower, newDirectMessage]
});
