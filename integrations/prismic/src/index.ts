import { Slate } from 'slates';
import { spec } from './spec';
import {
  queryDocuments,
  getDocument,
  getRepositoryInfo,
  listCustomTypes,
  getCustomType,
  createCustomType,
  updateCustomType,
  deleteCustomType,
  listSharedSlices,
  createSharedSlice,
  updateSharedSlice,
  deleteSharedSlice,
  listAssets,
  uploadAsset,
  updateAsset,
  deleteAsset,
  createMigrationDocument,
  updateMigrationDocument
} from './tools';
import { documentChanges, releaseChanges, tagChanges } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    queryDocuments,
    getDocument,
    getRepositoryInfo,
    listCustomTypes,
    getCustomType,
    createCustomType,
    updateCustomType,
    deleteCustomType,
    listSharedSlices,
    createSharedSlice,
    updateSharedSlice,
    deleteSharedSlice,
    listAssets,
    uploadAsset,
    updateAsset,
    deleteAsset,
    createMigrationDocument,
    updateMigrationDocument
  ],
  triggers: [documentChanges, releaseChanges, tagChanges]
});
