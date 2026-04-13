import { Slate } from 'slates';
import { spec } from './spec';
import {
  listVideos,
  createVideo,
  deleteVideos,
  getVideoAnalytics,
  getTopVideos,
  updateVideoSource,
  listGroups,
  createGroup,
  updatePlayerSettings,
  listWhitelistedDomains,
  addWhitelistedDomain
} from './tools';
import { videoWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listVideos,
    createVideo,
    deleteVideos,
    getVideoAnalytics,
    getTopVideos,
    updateVideoSource,
    listGroups,
    createGroup,
    updatePlayerSettings,
    listWhitelistedDomains,
    addWhitelistedDomain
  ],
  triggers: [videoWebhook]
});
