import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  manageAlbumMedia,
  addAlbumEnrichment,
  getMediaItem,
  searchMediaItems,
  updateMediaItem,
  uploadMedia,
  createPickerSession,
  getPickerSession,
  listPickedMedia,
  deletePickerSession
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listAlbums,
    getAlbum,
    createAlbum,
    updateAlbum,
    manageAlbumMedia,
    addAlbumEnrichment,
    getMediaItem,
    searchMediaItems,
    updateMediaItem,
    uploadMedia,
    createPickerSession,
    getPickerSession,
    listPickedMedia,
    deletePickerSession
  ],
  triggers: [inboundWebhook]
});
