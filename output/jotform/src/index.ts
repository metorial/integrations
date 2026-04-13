import { Slate } from 'slates';
import { spec } from './spec';
import {
  listFormsTool,
  getFormTool,
  createFormTool,
  updateFormTool,
  deleteFormTool,
  cloneFormTool,
  listSubmissionsTool,
  getSubmissionTool,
  createSubmissionTool,
  updateSubmissionTool,
  deleteSubmissionTool,
  getUserTool,
  listFoldersTool,
  manageWebhooksTool,
  listReportsTool,
  createReportTool
} from './tools';
import {
  formSubmissionWebhookTrigger,
  newSubmissionPollingTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listFormsTool,
    getFormTool,
    createFormTool,
    updateFormTool,
    deleteFormTool,
    cloneFormTool,
    listSubmissionsTool,
    getSubmissionTool,
    createSubmissionTool,
    updateSubmissionTool,
    deleteSubmissionTool,
    getUserTool,
    listFoldersTool,
    manageWebhooksTool,
    listReportsTool,
    createReportTool
  ],
  triggers: [
    formSubmissionWebhookTrigger,
    newSubmissionPollingTrigger
  ]
});
