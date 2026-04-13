import { Slate } from 'slates';
import { spec } from './spec';

import {
  getVideoTool,
  listVideosTool,
  searchVideosTool,
  editVideoTool,
  deleteVideoTool,
  listCommentsTool,
  addCommentTool,
  getUserTool,
  listLikedVideosTool,
  likeVideoTool,
  listShowcasesTool,
  createShowcaseTool,
  editShowcaseTool,
  deleteShowcaseTool,
  getShowcaseVideosTool,
  manageShowcaseVideoTool,
  listFoldersTool,
  createFolderTool,
  deleteFolderTool,
  listFolderVideosTool,
  manageFolderVideoTool,
  listChannelsTool,
  getChannelTool,
  createChannelTool,
  deleteChannelTool,
  listChannelVideosTool,
  manageChannelVideoTool,
  listCategoriesTool,
  listCategoryVideosTool
} from './tools';

import {
  videoEventsTrigger,
  newVideoTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getVideoTool,
    listVideosTool,
    searchVideosTool,
    editVideoTool,
    deleteVideoTool,
    listCommentsTool,
    addCommentTool,
    getUserTool,
    listLikedVideosTool,
    likeVideoTool,
    listShowcasesTool,
    createShowcaseTool,
    editShowcaseTool,
    deleteShowcaseTool,
    getShowcaseVideosTool,
    manageShowcaseVideoTool,
    listFoldersTool,
    createFolderTool,
    deleteFolderTool,
    listFolderVideosTool,
    manageFolderVideoTool,
    listChannelsTool,
    getChannelTool,
    createChannelTool,
    deleteChannelTool,
    listChannelVideosTool,
    manageChannelVideoTool,
    listCategoriesTool,
    listCategoryVideosTool
  ],
  triggers: [
    videoEventsTrigger,
    newVideoTrigger
  ]
});
