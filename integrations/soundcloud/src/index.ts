import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchTracks,
  searchPlaylists,
  searchUsers,
  getTrack,
  uploadTrack,
  updateTrack,
  deleteTrack,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  getUser,
  getMyProfile,
  getUserTracks,
  getUserPlaylists,
  getUserFollowers,
  getUserFollowings,
  likeTrack,
  repostTrack,
  likePlaylist,
  repostPlaylist,
  followUser,
  getTrackComments,
  createComment,
  resolveUrl,
  getOEmbed
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    searchTracks,
    searchPlaylists,
    searchUsers,
    getTrack,
    uploadTrack,
    updateTrack,
    deleteTrack,
    getPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    getUser,
    getMyProfile,
    getUserTracks,
    getUserPlaylists,
    getUserFollowers,
    getUserFollowings,
    likeTrack,
    repostTrack,
    likePlaylist,
    repostPlaylist,
    followUser,
    getTrackComments,
    createComment,
    resolveUrl,
    getOEmbed
  ],
  triggers: [
    inboundWebhook,
  ]
});
