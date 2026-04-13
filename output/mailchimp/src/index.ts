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
} from './tools';
import {
  audienceWebhookTrigger,
  campaignActivityTrigger,
} from './triggers';

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
  ],
  triggers: [
    audienceWebhookTrigger,
    campaignActivityTrigger,
  ],
});
