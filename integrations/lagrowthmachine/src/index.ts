import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchLead,
  createOrUpdateLead,
  removeLeadFromAudiences,
  updateLeadCampaignStatus,
  getCampaigns,
  listAudiences,
  sendLinkedInMessage,
  importFromLinkedIn,
  listIdentities,
  listMembers,
  createInboxWebhook,
  listInboxWebhooks,
  deleteInboxWebhook
} from './tools';
import {
  emailEvents,
  linkedinEvents,
  twitterEvents,
  leadLifecycleEvents,
  campaignEvents
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchLead,
    createOrUpdateLead,
    removeLeadFromAudiences,
    updateLeadCampaignStatus,
    getCampaigns,
    listAudiences,
    sendLinkedInMessage,
    importFromLinkedIn,
    listIdentities,
    listMembers,
    createInboxWebhook,
    listInboxWebhooks,
    deleteInboxWebhook
  ],
  triggers: [emailEvents, linkedinEvents, twitterEvents, leadLifecycleEvents, campaignEvents]
});
