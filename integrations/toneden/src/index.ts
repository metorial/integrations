import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCampaigns,
  manageCampaign,
  campaignInsights,
  listLinks,
  manageLink,
  linkInsights,
  listAttachments,
  manageAttachment,
  attachmentInsights,
  managePlaybook,
  manageUserList,
  uploadOfflineConversions,
  getProfile,
  updateProfile
} from './tools';
import { campaignStatusChange, newLink, newAttachment, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCampaigns,
    manageCampaign,
    campaignInsights,
    listLinks,
    manageLink,
    linkInsights,
    listAttachments,
    manageAttachment,
    attachmentInsights,
    managePlaybook,
    manageUserList,
    uploadOfflineConversions,
    getProfile,
    updateProfile
  ],
  triggers: [inboundWebhook, campaignStatusChange, newLink, newAttachment]
});
