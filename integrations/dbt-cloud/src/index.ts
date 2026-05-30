import { Slate } from 'slates';
import { spec } from './spec';
import {
  cancelRunTool,
  getAccountTool,
  getJobTool,
  getRunArtifactTool,
  getRunTool,
  listEnvironmentsTool,
  listJobsTool,
  listProjectsTool,
  listRunsTool,
  listUsersTool,
  manageWebhookTool,
  triggerJobRunTool
} from './tools';
import { jobRunEventTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getAccountTool,
    listProjectsTool,
    listEnvironmentsTool,
    listJobsTool,
    getJobTool,
    triggerJobRunTool,
    listRunsTool,
    getRunTool,
    cancelRunTool,
    getRunArtifactTool,
    listUsersTool,
    manageWebhookTool
  ],
  triggers: [jobRunEventTrigger]
});
