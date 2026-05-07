import { Slate } from 'slates';
import { spec } from './spec';
import {
  listAudiencesTool,
  manageAudienceTool,
  listMembersTool,
  manageMemberTool,
  manageTagsTool,
  listCampaignsTool,
  manageCampaignTool,
  sendCampaignTool,
  manageCampaignContentTool,
  listTemplatesTool,
  manageTemplateTool,
  listAutomationsTool,
  manageAutomationTool,
  getCampaignReportTool,
  searchMembersTool,
  manageSegmentsTool,
  getAudienceActivityTool,
  addMemberEventTool,
  manageMergeFieldsTool,
  manageInterestGroupsTool,
  manageFileManagerTool
} from './tools';
import { audienceWebhookTrigger, campaignActivityTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listAudiencesTool,
    manageAudienceTool,
    listMembersTool,
    manageMemberTool,
    manageTagsTool,
    listCampaignsTool,
    manageCampaignTool,
    sendCampaignTool,
    manageCampaignContentTool,
    listTemplatesTool,
    manageTemplateTool,
    listAutomationsTool,
    manageAutomationTool,
    getCampaignReportTool,
    searchMembersTool,
    manageSegmentsTool,
    getAudienceActivityTool,
    addMemberEventTool,
    manageMergeFieldsTool,
    manageInterestGroupsTool,
    manageFileManagerTool
  ],
  triggers: [audienceWebhookTrigger, campaignActivityTrigger]
});
