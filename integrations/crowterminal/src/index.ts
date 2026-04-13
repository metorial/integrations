import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPost,
  getPost,
  listPosts,
  updatePost,
  deletePost,
  listAccounts,
  manageSchedule
} from './tools';
import { postStatusChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPost,
    getPost,
    listPosts,
    updatePost,
    deletePost,
    listAccounts,
    manageSchedule
  ],
  triggers: [inboundWebhook, postStatusChanges]
});
