import { Slate } from 'slates';
import { spec } from './spec';
import {
  getUserProfile,
  listVideos,
  queryVideos,
  getCreatorInfo,
  postVideo,
  postPhoto,
  getPublishStatus,
  listAdvertisers,
  getCampaigns,
  manageCampaign,
  getAdGroups,
  createAdGroup,
  getAds,
  getAdReport
} from './tools';
import { consumerWebhook, businessWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserProfile,
    listVideos,
    queryVideos,
    getCreatorInfo,
    postVideo,
    postPhoto,
    getPublishStatus,
    listAdvertisers,
    getCampaigns,
    manageCampaign,
    getAdGroups,
    createAdGroup,
    getAds,
    getAdReport
  ],
  triggers: [consumerWebhook, businessWebhook]
});
