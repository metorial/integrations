import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchContent,
  listVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  rateVideo,
  getChannel,
  updateChannel,
  managePlaylist,
  listPlaylists,
  listMetadata,
  managePlaylistItems,
  manageComments,
  listComments,
  manageSubscriptions,
  listCaptions,
  listActivities
} from './tools';
import { channelActivity, newVideo, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchContent,
    listVideos,
    getVideo,
    updateVideo,
    deleteVideo,
    rateVideo,
    getChannel,
    updateChannel,
    managePlaylist,
    listPlaylists,
    listMetadata,
    managePlaylistItems,
    manageComments,
    listComments,
    manageSubscriptions,
    listCaptions,
    listActivities
  ],
  triggers: [inboundWebhook, channelActivity, newVideo]
});
