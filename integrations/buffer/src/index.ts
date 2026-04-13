import { Slate } from 'slates';
import { spec } from './spec';
import {
  getUserTool,
  getProfilesTool,
  createUpdateTool,
  editUpdateTool,
  deleteUpdateTool,
  shareUpdateTool,
  getUpdatesTool,
  manageQueueTool,
  manageScheduleTool,
  getInteractionsTool,
  getLinkSharesTool,
  getConfigurationTool
} from './tools';
import { newUpdateSentTrigger, newUpdateQueuedTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getUserTool,
    getProfilesTool,
    createUpdateTool,
    editUpdateTool,
    deleteUpdateTool,
    shareUpdateTool,
    getUpdatesTool,
    manageQueueTool,
    manageScheduleTool,
    getInteractionsTool,
    getLinkSharesTool,
    getConfigurationTool
  ],
  triggers: [inboundWebhook, newUpdateSentTrigger, newUpdateQueuedTrigger]
});
