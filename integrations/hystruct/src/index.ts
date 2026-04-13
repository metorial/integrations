import { Slate } from 'slates';
import { spec } from './spec';
import {
  getWorkflowData,
  createJob,
  listWebhooks,
  subscribeWebhook,
  unsubscribeWebhook
} from './tools';
import { workflowEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [getWorkflowData, createJob, listWebhooks, subscribeWebhook, unsubscribeWebhook],
  triggers: [workflowEvents]
});
