import { Slate } from 'slates';
import { spec } from './spec';
import {
  getUserInfo,
  getActivityLogs,
  listCampaigns,
  getCampaignNotifications,
  toggleCampaign,
  getNotificationData,
  createConversion
} from './tools';
import { leadCollected } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserInfo,
    getActivityLogs,
    listCampaigns,
    getCampaignNotifications,
    toggleCampaign,
    getNotificationData,
    createConversion
  ],
  triggers: [leadCollected]
});
