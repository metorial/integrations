import { Slate } from 'slates';
import { spec } from './spec';
import {
  getUserProfile,
  listPages,
  getPosts,
  publishContent,
  managePost,
  manageComments,
  getPageInsights,
  searchFacebook,
  getAdInsights,
  getLeads,
  sendPageMessage
} from './tools';
import { pageWebhook, newPagePost, newLead } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserProfile,
    listPages,
    getPosts,
    publishContent,
    managePost,
    manageComments,
    getPageInsights,
    searchFacebook,
    getAdInsights,
    getLeads,
    sendPageMessage
  ],
  triggers: [pageWebhook, newPagePost, newLead]
});
