import { Slate } from 'slates';
import { spec } from './spec';
import {
  getSubreddit,
  getPost,
  searchReddit,
  submitPost,
  managePost,
  submitComment,
  manageComment,
  vote,
  saveContent,
  getUser,
  manageMessages,
  manageSubscriptions,
  moderateContent,
  manageFlair,
  manageWiki
} from './tools';
import { newPost, newComment, newMessage, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getSubreddit,
    getPost,
    searchReddit,
    submitPost,
    managePost,
    submitComment,
    manageComment,
    vote,
    saveContent,
    getUser,
    manageMessages,
    manageSubscriptions,
    moderateContent,
    manageFlair,
    manageWiki
  ],
  triggers: [inboundWebhook, newPost, newComment, newMessage]
});
