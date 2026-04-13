import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchEntries,
  getEntry,
  createEntry,
  updateEntry,
  manageEntryLifecycle,
  searchAssets,
  getAsset,
  createAsset,
  manageAssetLifecycle,
  listContentTypes,
  manageContentType,
  manageTags,
  listLocales,
  listEnvironments,
  syncContent,
  scheduleAction,
  manageRelease
} from './tools';
import { entryEvents, assetEvents, contentTypeEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchEntries,
    getEntry,
    createEntry,
    updateEntry,
    manageEntryLifecycle,
    searchAssets,
    getAsset,
    createAsset,
    manageAssetLifecycle,
    listContentTypes,
    manageContentType,
    manageTags,
    listLocales,
    listEnvironments,
    syncContent,
    scheduleAction,
    manageRelease
  ],
  triggers: [entryEvents, assetEvents, contentTypeEvents]
});
