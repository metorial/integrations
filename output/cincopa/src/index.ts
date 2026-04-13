import { Slate } from 'slates';
import { spec } from './spec';
import {
  listGalleries,
  createGallery,
  manageGallery,
  galleryItems,
  listAssets,
  manageAsset,
  getAssetTags,
  uploadMedia,
  managePortal,
  manageLiveStream
} from './tools';
import {
  assetEvents,
  galleryEvents,
  leadEvents,
  accountEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listGalleries,
    createGallery,
    manageGallery,
    galleryItems,
    listAssets,
    manageAsset,
    getAssetTags,
    uploadMedia,
    managePortal,
    manageLiveStream
  ],
  triggers: [
    assetEvents,
    galleryEvents,
    leadEvents,
    accountEvents
  ]
});
