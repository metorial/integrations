import { Slate } from 'slates';
import { spec } from './spec';
import {
  listOpportunitiesTool,
  getOpportunityTool,
  createOpportunityTool,
  updateOpportunityTool,
  listPostingsTool,
  managePostingTool,
  manageInterviewTool,
  addNoteTool,
  manageUserTool,
  listUsersTool,
  getPipelineMetadataTool,
  getOpportunityActivityTool,
  manageRequisitionTool,
  updateContactTool,
} from './tools';
import {
  opportunityEventsTrigger,
  interviewEventsTrigger,
  contactEventsTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listOpportunitiesTool,
    getOpportunityTool,
    createOpportunityTool,
    updateOpportunityTool,
    listPostingsTool,
    managePostingTool,
    manageInterviewTool,
    addNoteTool,
    manageUserTool,
    listUsersTool,
    getPipelineMetadataTool,
    getOpportunityActivityTool,
    manageRequisitionTool,
    updateContactTool,
  ],
  triggers: [
    opportunityEventsTrigger,
    interviewEventsTrigger,
    contactEventsTrigger,
  ],
});
