import { Slate } from 'slates';
import { spec } from './spec';
import {
  verifyEmailTool,
  createJobTool,
  getJobStatusTool,
  getJobResultsTool,
  searchJobsTool,
  manageJobTool,
  getAccountInfoTool,
  confirmPoeTool,
} from './tools';
import { jobStatusChangedTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    verifyEmailTool,
    createJobTool,
    getJobStatusTool,
    getJobResultsTool,
    searchJobsTool,
    manageJobTool,
    getAccountInfoTool,
    confirmPoeTool,
  ],
  triggers: [
    jobStatusChangedTrigger,
  ],
});
