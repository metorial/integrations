import { Slate } from 'slates';
import { spec } from './spec';
import {
  getDocument,
  listDocuments,
  searchDocuments,
  uploadDocument,
  createUploadSession,
  downloadDocument,
  manageDocument,
  shareDocument,
  listPermissions,
  removePermission,
  documentVersions,
  documentCheckinCheckout,
  documentPreview,
  createFolder,
} from './tools';
import { driveItemChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getDocument,
    listDocuments,
    searchDocuments,
    uploadDocument,
    createUploadSession,
    downloadDocument,
    manageDocument,
    shareDocument,
    listPermissions,
    removePermission,
    documentVersions,
    documentCheckinCheckout,
    documentPreview,
    createFolder,
  ],
  triggers: [
    driveItemChanges,
  ],
});
