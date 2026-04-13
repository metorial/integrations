import { Slate } from 'slates';
import { spec } from './spec';
import {
  createCandidateTool,
  getCandidateTool,
  updateCandidateTool,
  createApplicationTool,
  updateApplicationTool,
  listApplicationsTool,
  listJobsTool,
  createJobTool,
  updateJob,
  manageOfferTool,
  manageInterviewScheduleTool,
  listOrganizationTool,
  setCustomField
} from './tools';
import {
  candidateEventsTrigger,
  applicationEventsTrigger,
  jobEventsTrigger,
  offerEventsTrigger,
  interviewEventsTrigger,
  openingEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    createCandidateTool,
    getCandidateTool,
    updateCandidateTool,
    createApplicationTool,
    updateApplicationTool,
    listApplicationsTool,
    listJobsTool,
    createJobTool,
    updateJob,
    manageOfferTool,
    manageInterviewScheduleTool,
    listOrganizationTool,
    setCustomField
  ],
  triggers: [
    candidateEventsTrigger,
    applicationEventsTrigger,
    jobEventsTrigger,
    offerEventsTrigger,
    interviewEventsTrigger,
    openingEventsTrigger
  ]
});
