import { Slate } from 'slates';
import { spec } from './spec';
import {
  listVideos,
  createVideo,
  getVideoDownload,
  getVideoTranscript,
  listUsers,
  createUser,
  inviteUsers,
  updateUser,
  deleteUser,
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  manageGroupMembers,
  manageVideoComments,
  manageTagSessionNotes,
  managePortfolio,
  listPortfolios
} from './tools';
import { newVideo, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listVideos,
    createVideo,
    getVideoDownload,
    getVideoTranscript,
    listUsers,
    createUser,
    inviteUsers,
    updateUser,
    deleteUser,
    listGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    manageGroupMembers,
    manageVideoComments,
    manageTagSessionNotes,
    managePortfolio,
    listPortfolios
  ],
  triggers: [inboundWebhook, newVideo]
});
