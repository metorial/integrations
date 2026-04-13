import {
  Slate } from 'slates';
import { spec } from './spec';
import { listJobs, listInterviewResponses } from './tools';
import { newInterviewResponse,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [listJobs, listInterviewResponses],
  triggers: [
    inboundWebhook,newInterviewResponse],
});
