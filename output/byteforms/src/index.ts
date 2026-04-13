import {
  Slate } from 'slates';
import { spec } from './spec';
import { listFormsTool, getFormTool, listSubmissionsTool } from './tools';
import { newSubmissionTrigger,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listFormsTool, getFormTool, listSubmissionsTool],
  triggers: [
    inboundWebhook,newSubmissionTrigger],
});
