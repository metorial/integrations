import { Slate } from 'slates';
import { spec } from './spec';
import {
  listIssuesTool,
  getIssueTool,
  updateIssueTool,
  listProjectsTool,
  manageProjectTool,
  listTeamsTool,
  manageTeamTool,
  manageReleaseTool,
  manageAlertRuleTool,
  manageMonitorTool,
  discoverQueryTool,
  getEventTool,
  manageIssueCommentTool,
  getOrganizationTool,
  listMembersTool
} from './tools';
import {
  issueEventsTrigger,
  errorEventsTrigger,
  alertEventsTrigger,
  commentEventsTrigger,
  installationEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listIssuesTool,
    getIssueTool,
    updateIssueTool,
    listProjectsTool,
    manageProjectTool,
    listTeamsTool,
    manageTeamTool,
    manageReleaseTool,
    manageAlertRuleTool,
    manageMonitorTool,
    discoverQueryTool,
    getEventTool,
    manageIssueCommentTool,
    getOrganizationTool,
    listMembersTool
  ],
  triggers: [
    issueEventsTrigger,
    errorEventsTrigger,
    alertEventsTrigger,
    commentEventsTrigger,
    installationEventsTrigger
  ]
});
