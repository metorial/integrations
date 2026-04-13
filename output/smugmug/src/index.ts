import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getUserTool,
  createAlbumTool,
  updateAlbumTool,
  deleteAlbumTool,
  getAlbumTool,
  getImageTool,
  updateImageTool,
  deleteImageTool,
  uploadImageTool,
  moveImagesTool,
  getNodeTool,
  createNodeTool,
  updateNodeTool,
  deleteNodeTool,
  searchTool,
  listAlbumImagesTool,
  getCommentsTool,
  getWatermarksTool,
  getShareUrisTool,
  browseFolderTool,
} from './tools';
import {
  newImagesTrigger,
  albumUpdatedTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserTool,
    createAlbumTool,
    updateAlbumTool,
    deleteAlbumTool,
    getAlbumTool,
    getImageTool,
    updateImageTool,
    deleteImageTool,
    uploadImageTool,
    moveImagesTool,
    getNodeTool,
    createNodeTool,
    updateNodeTool,
    deleteNodeTool,
    searchTool,
    listAlbumImagesTool,
    getCommentsTool,
    getWatermarksTool,
    getShareUrisTool,
    browseFolderTool,
  ],
  triggers: [
    inboundWebhook,
    newImagesTrigger,
    albumUpdatedTrigger,
  ],
});
