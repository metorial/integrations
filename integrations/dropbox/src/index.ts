import { Slate } from 'slates';
import { spec } from './spec';
import {
  listFolder,
  getFileMetadata,
  createFolder,
  moveOrCopy,
  deleteFile,
  uploadFile,
  downloadFile,
  searchFiles,
  manageSharedLink,
  shareFolder,
  manageFileRequest,
  getAccountInfo,
  fileRevisions
} from './tools';
import { fileChanges, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFolder,
    getFileMetadata,
    createFolder,
    moveOrCopy,
    deleteFile,
    uploadFile,
    downloadFile,
    searchFiles,
    manageSharedLink,
    shareFolder,
    manageFileRequest,
    getAccountInfo,
    fileRevisions
  ],
  triggers: [inboundWebhook, fileChanges]
});
