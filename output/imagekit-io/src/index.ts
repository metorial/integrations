import { Slate } from 'slates';
import { spec } from './spec';
import {
  uploadFile,
  listFiles,
  getFile,
  updateFile,
  deleteFiles,
  copyMoveFile,
  manageTags,
  manageCustomMetadataFields,
  getFileMetadata,
  purgeCache,
  manageFolders,
  manageFileVersions,
} from './tools';
import {
  videoTransformation,
  uploadTransform,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    uploadFile,
    listFiles,
    getFile,
    updateFile,
    deleteFiles,
    copyMoveFile,
    manageTags,
    manageCustomMetadataFields,
    getFileMetadata,
    purgeCache,
    manageFolders,
    manageFileVersions,
  ],
  triggers: [
    videoTransformation,
    uploadTransform,
  ],
});
