import { Slate } from 'slates';
import { spec } from './spec';
import {
  getPost,
  listPosts,
  publishPost,
  updatePost,
  deletePost,
  manageDraft,
  getPublication,
  manageSeries,
  manageComments,
  getUser,
  searchPosts,
  listStaticPages,
  subscribeNewsletter,
} from './tools';
import {
  postEvents,
  staticPageEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getPost,
    listPosts,
    publishPost,
    updatePost,
    deletePost,
    manageDraft,
    getPublication,
    manageSeries,
    manageComments,
    getUser,
    searchPosts,
    listStaticPages,
    subscribeNewsletter,
  ],
  triggers: [
    postEvents,
    staticPageEvents,
  ],
});
