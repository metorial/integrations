import { Slate } from 'slates';
import { spec } from './spec';
import {
  listJobsTool,
  getJobTool,
  listCandidatesTool,
  getCandidateTool,
  createCandidateTool,
  manageCandidateTool,
  listEmployeesTool,
  manageEmployeeTool,
  manageRequisitionTool,
  listEventsTool,
  listDepartmentsTool,
  manageTimeOffTool,
  getAccountTool
} from './tools';
import {
  candidateEventsTrigger,
  employeeEventsTrigger,
  timeoffEventsTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listJobsTool,
    getJobTool,
    listCandidatesTool,
    getCandidateTool,
    createCandidateTool,
    manageCandidateTool,
    listEmployeesTool,
    manageEmployeeTool,
    manageRequisitionTool,
    listEventsTool,
    listDepartmentsTool,
    manageTimeOffTool,
    getAccountTool
  ],
  triggers: [
    candidateEventsTrigger,
    employeeEventsTrigger,
    timeoffEventsTrigger
  ]
});
