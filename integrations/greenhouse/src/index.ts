import { Slate } from 'slates';
import { spec } from './spec';
import {
  listCandidatesTool,
  getCandidateTool,
  createCandidateTool,
  updateCandidateTool,
  listApplicationsTool,
  getApplicationTool,
  advanceApplicationTool,
  rejectApplicationTool,
  listJobsTool,
  getJobTool,
  createJobTool,
  listOffersTool,
  listUsersTool,
  getUserTool,
  listDepartmentsTool,
  listOfficesTool,
  listScheduledInterviewsTool,
  addCandidateNoteTool,
  manageCandidateTagsTool
} from './tools';
import {
  applicationEventsTrigger,
  candidateEventsTrigger,
  jobEventsTrigger,
  interviewEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listCandidatesTool,
    getCandidateTool,
    createCandidateTool,
    updateCandidateTool,
    listApplicationsTool,
    getApplicationTool,
    advanceApplicationTool,
    rejectApplicationTool,
    listJobsTool,
    getJobTool,
    createJobTool,
    listOffersTool,
    listUsersTool,
    getUserTool,
    listDepartmentsTool,
    listOfficesTool,
    listScheduledInterviewsTool,
    addCandidateNoteTool,
    manageCandidateTagsTool
  ],
  triggers: [
    applicationEventsTrigger,
    candidateEventsTrigger,
    jobEventsTrigger,
    interviewEventsTrigger
  ]
});
