import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchPhotos,
  getPhoto,
  curatedPhotos,
  searchVideos,
  getVideo,
  popularVideos,
  listCollections,
  getCollectionMedia
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchPhotos,
    getPhoto,
    curatedPhotos,
    searchVideos,
    getVideo,
    popularVideos,
    listCollections,
    getCollectionMedia
  ],
  triggers: [inboundWebhook]
});
