import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchContent,
  getVideo,
  updateVideo,
  deleteVideo,
  rateVideo,
  getChannel,
  updateChannel,
  managePlaylist,
  listPlaylists,
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
    getVideo,
    updateVideo,
    deleteVideo,
    rateVideo,
    getChannel,
    updateChannel,
    managePlaylist,
    listPlaylists,
    managePlaylistItems,
    manageComments,
    listComments,
    manageSubscriptions,
    listCaptions,
    listActivities
  ],
  triggers: [inboundWebhook, channelActivity, newVideo]
});
