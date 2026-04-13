import { Slate } from 'slates';
import { spec } from './spec';
import {
  getPresentation,
  listFiles,
  uploadPresentation,
  downloadPresentation,
  deletePresentation,
  moveCopyFile,
  updateFileMetadata,
  shareFile,
  managePermissions,
  searchPresentations,
  versionHistory,
  getThumbnails,
  createFolder
} from './tools';
import { driveItemChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getPresentation,
    listFiles,
    uploadPresentation,
    downloadPresentation,
    deletePresentation,
    moveCopyFile,
    updateFileMetadata,
    shareFile,
    managePermissions,
    searchPresentations,
    versionHistory,
    getThumbnails,
    createFolder
  ],
  triggers: [driveItemChanges]
});
