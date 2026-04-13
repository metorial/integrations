import { Slate } from 'slates';
import { spec } from './spec';
import {
  listDrivesTool,
  listItemsTool,
  getItemTool,
  uploadFileTool,
  createUploadSessionTool,
  downloadFileTool,
  createFolderTool,
  copyItemTool,
  moveRenameItemTool,
  deleteItemTool,
  searchFilesTool,
  shareItemTool,
  managePermissionsTool
} from './tools';
import { driveItemChangesTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listDrivesTool,
    listItemsTool,
    getItemTool,
    uploadFileTool,
    createUploadSessionTool,
    downloadFileTool,
    createFolderTool,
    copyItemTool,
    moveRenameItemTool,
    deleteItemTool,
    searchFilesTool,
    shareItemTool,
    managePermissionsTool
  ],
  triggers: [driveItemChangesTrigger]
});
