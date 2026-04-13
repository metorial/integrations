import { Slate } from 'slates';
import { spec } from './spec';
import {
  createPost,
  updatePost,
  getPost,
  listPosts,
  schedulePost,
  deletePosts,
  listAccounts,
  listMedia,
  getMediaFile,
  deleteMediaFiles,
  createTag,
  listTags,
  deleteTag,
  listReports,
  listAutoresponders
} from './tools';
import {
  newPostCreated,
  newFileUploaded,
  newAccountConnected,
  inboundWebhook
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createPost,
    updatePost,
    getPost,
    listPosts,
    schedulePost,
    deletePosts,
    listAccounts,
    listMedia,
    getMediaFile,
    deleteMediaFiles,
    createTag,
    listTags,
    deleteTag,
    listReports,
    listAutoresponders
  ],
  triggers: [inboundWebhook, newPostCreated, newFileUploaded, newAccountConnected]
});
