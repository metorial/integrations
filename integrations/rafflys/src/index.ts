import {
  Slate } from 'slates';
import { spec } from './spec';
import { getUserTool, listPromotionsTool, getPromotionLeadsTool } from './tools';
import { newLeadTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getUserTool, listPromotionsTool, getPromotionLeadsTool],
  triggers: [
    inboundWebhook,newLeadTrigger]
});
