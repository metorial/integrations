import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPost,
  deletePost,
  updatePost,
  getPostHistory,
  getPostAnalytics,
  getSocialAnalytics,
  getComments,
  postComment,
  deleteComment,
  sendMessage,
  getMessages,
  uploadMedia,
  generateHashtags,
  createProfile,
  getProfiles,
  deleteProfile,
  getReviews,
  validatePost,
  addFeed,
  getFeeds,
  deleteFeed
} from './tools';
import {
  scheduledPostTrigger,
  socialAccountTrigger,
  messagesTrigger,
  feedTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPost,
    deletePost,
    updatePost,
    getPostHistory,
    getPostAnalytics,
    getSocialAnalytics,
    getComments,
    postComment,
    deleteComment,
    sendMessage,
    getMessages,
    uploadMedia,
    generateHashtags,
    createProfile,
    getProfiles,
    deleteProfile,
    getReviews,
    validatePost,
    addFeed,
    getFeeds,
    deleteFeed
  ],
  triggers: [scheduledPostTrigger, socialAccountTrigger, messagesTrigger, feedTrigger]
});
