import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  searchFilesTool,
  getFileTool,
  createFileTool,
  uploadFileTool,
  downloadFileTool,
  exportFileTool,
  updateFileTool,
  copyFileTool,
  deleteFileTool,
  listPermissionsTool,
  shareFileTool,
  updatePermissionTool,
  removePermissionTool,
  listCommentsTool,
  createCommentTool,
  replyToCommentTool,
  deleteCommentTool,
  listRevisionsTool,
  listSharedDrivesTool,
  createSharedDriveTool,
  updateSharedDriveTool,
  deleteSharedDriveTool
} from './tools';
import { fileChangesTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchFilesTool,
    getFileTool,
    createFileTool,
    uploadFileTool,
    downloadFileTool,
    exportFileTool,
    updateFileTool,
    copyFileTool,
    deleteFileTool,
    listPermissionsTool,
    shareFileTool,
    updatePermissionTool,
    removePermissionTool,
    listCommentsTool,
    createCommentTool,
    replyToCommentTool,
    deleteCommentTool,
    listRevisionsTool,
    listSharedDrivesTool,
    createSharedDriveTool,
    updateSharedDriveTool,
    deleteSharedDriveTool
  ],
  triggers: [
    inboundWebhook,
    fileChangesTrigger
  ]
});
