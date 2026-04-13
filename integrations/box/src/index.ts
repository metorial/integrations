import { Slate } from 'slates';
import { spec } from './spec';
import {
  getFileInfo,
  uploadFile,
  manageFile,
  getDownloadUrl,
  listFolderItems,
  manageFolder,
  searchContent,
  manageCollaboration,
  manageSharedLink,
  manageComments,
  manageTasks,
  manageMetadata,
  manageSignRequest,
  listUsers,
  manageWebLink
} from './tools';
import {
  fileEvents,
  folderEvents,
  collaborationEvents,
  commentEvents,
  sharedLinkEvents,
  metadataEvents,
  taskAssignmentEvents,
  signRequestEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getFileInfo,
    uploadFile,
    manageFile,
    getDownloadUrl,
    listFolderItems,
    manageFolder,
    searchContent,
    manageCollaboration,
    manageSharedLink,
    manageComments,
    manageTasks,
    manageMetadata,
    manageSignRequest,
    listUsers,
    manageWebLink
  ] as any,
  triggers: [
    fileEvents,
    folderEvents,
    collaborationEvents,
    commentEvents,
    sharedLinkEvents,
    metadataEvents,
    taskAssignmentEvents,
    signRequestEvents
  ] as any
});
