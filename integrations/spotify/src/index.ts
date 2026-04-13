import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchCatalog,
  getArtist,
  getAlbum,
  getTrack,
  managePlaylist,
  controlPlayback,
  manageLibrary,
  getUserProfile,
  getTopItems,
  manageFollowing,
  getRecentlyPlayed
} from './tools';
import { recentlyPlayedTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchCatalog.build(),
    getArtist.build(),
    getAlbum.build(),
    getTrack.build(),
    managePlaylist.build(),
    controlPlayback.build(),
    manageLibrary.build(),
    getUserProfile.build(),
    getTopItems.build(),
    manageFollowing.build(),
    getRecentlyPlayed.build()
  ],
  triggers: [inboundWebhook, recentlyPlayedTrigger.build()]
});
