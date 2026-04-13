import { Slate } from 'slates';
import { spec } from './spec';
import {
  uploadAsset,
  searchAssets,
  getAsset,
  updateAsset,
  deleteAssets,
  manageTags,
  listAssets,
  manageFolders,
  getUsage
} from './tools';
import { assetEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    uploadAsset,
    searchAssets,
    getAsset,
    updateAsset,
    deleteAssets,
    manageTags,
    listAssets,
    manageFolders,
    getUsage
  ],
  triggers: [assetEvent]
});
