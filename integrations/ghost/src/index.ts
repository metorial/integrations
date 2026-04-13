import { Slate } from 'slates';
import { spec } from './spec';
import {
  browsePosts,
  managePost,
  browsePages,
  managePage,
  browseTags,
  manageTag,
  browseMembers,
  manageMember,
  browseNewsletters,
  manageNewsletter,
  browseTiers,
  manageOffer,
  browseUsers,
  getSite,
  manageWebhook,
} from './tools';
import {
  postEvents,
  pageEvents,
  tagEvents,
  memberEvents,
  siteChanged,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    browsePosts,
    managePost,
    browsePages,
    managePage,
    browseTags,
    manageTag,
    browseMembers,
    manageMember,
    browseNewsletters,
    manageNewsletter,
    browseTiers,
    manageOffer,
    browseUsers,
    getSite,
    manageWebhook,
  ],
  triggers: [
    postEvents,
    pageEvents,
    tagEvents,
    memberEvents,
    siteChanged,
  ],
});
