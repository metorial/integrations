import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listPostsTool,
  getPostTool,
  createPostTool,
  updatePostTool,
  deletePostTool,
  listPagesTool,
  createPageTool,
  updatePageTool,
  deletePageTool,
  listCommentsTool,
  createCommentTool,
  moderateCommentTool,
  deleteCommentTool,
  listMediaTool,
  getMediaTool,
  updateMediaTool,
  deleteMediaTool,
  listCategoriesTool,
  createCategoryTool,
  deleteCategoryTool,
  listTagsTool,
  createTagTool,
  deleteTagTool,
  listUsersTool,
  getCurrentUserTool,
  getSiteInfoTool,
  getSiteStatsTool,
  searchContentTool
} from './tools';
import {
  postChangesTrigger,
  newCommentTrigger,
  pageChangesTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listPostsTool,
    getPostTool,
    createPostTool,
    updatePostTool,
    deletePostTool,
    listPagesTool,
    createPageTool,
    updatePageTool,
    deletePageTool,
    listCommentsTool,
    createCommentTool,
    moderateCommentTool,
    deleteCommentTool,
    listMediaTool,
    getMediaTool,
    updateMediaTool,
    deleteMediaTool,
    listCategoriesTool,
    createCategoryTool,
    deleteCategoryTool,
    listTagsTool,
    createTagTool,
    deleteTagTool,
    listUsersTool,
    getCurrentUserTool,
    getSiteInfoTool,
    getSiteStatsTool,
    searchContentTool
  ],
  triggers: [
    inboundWebhook,
    postChangesTrigger,
    newCommentTrigger,
    pageChangesTrigger
  ]
});
