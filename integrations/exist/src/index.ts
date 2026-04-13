import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  getProfileTool,
  getAttributesTool,
  getAttributeValuesTool,
  updateAttributeValuesTool,
  incrementAttributeValuesTool,
  manageAttributeOwnershipTool,
  createAttributeTool,
  getCorrelationsTool,
  getInsightsTool,
  getAveragesTool,
} from './tools';
import { newInsightsTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getProfileTool,
    getAttributesTool,
    getAttributeValuesTool,
    updateAttributeValuesTool,
    incrementAttributeValuesTool,
    manageAttributeOwnershipTool,
    createAttributeTool,
    getCorrelationsTool,
    getInsightsTool,
    getAveragesTool,
  ],
  triggers: [
    inboundWebhook,
    newInsightsTrigger,
  ],
});
