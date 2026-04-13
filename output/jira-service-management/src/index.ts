import { Slate } from 'slates';
import { spec } from './spec';
import {
  searchIssuesTool,
  getIssueTool,
  createIssueTool,
  updateIssueTool,
  deleteIssueTool,
  addCommentTool,
  createCustomerRequestTool,
  listServiceDesksTool,
  listRequestTypesTool,
  manageQueueTool,
  manageApprovalTool,
  getSlaInformationTool,
  manageOrganizationTool,
  manageCustomerTool,
  searchKnowledgeBaseTool,
  listProjectsTool,
  searchUsersTool,
} from './tools';
import {
  issueEventsTrigger,
  commentEventsTrigger,
  projectEventsTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    searchIssuesTool,
    getIssueTool,
    createIssueTool,
    updateIssueTool,
    deleteIssueTool,
    addCommentTool,
    createCustomerRequestTool,
    listServiceDesksTool,
    listRequestTypesTool,
    manageQueueTool,
    manageApprovalTool,
    getSlaInformationTool,
    manageOrganizationTool,
    manageCustomerTool,
    searchKnowledgeBaseTool,
    listProjectsTool,
    searchUsersTool,
  ],
  triggers: [
    issueEventsTrigger,
    commentEventsTrigger,
    projectEventsTrigger,
  ],
});
