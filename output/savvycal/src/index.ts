import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEventsTool,
  getEventTool,
  createEventTool,
  cancelEventTool,
  listLinksTool,
  manageLinkTool,
  getUserTool,
  listWorkflowsTool,
  listTimeZonesTool
} from './tools';
import {
  eventLifecycleTrigger,
  eventCheckoutTrigger,
  eventAttendeeTrigger,
  pollResponseTrigger,
  workflowActionTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listEventsTool,
    getEventTool,
    createEventTool,
    cancelEventTool,
    listLinksTool,
    manageLinkTool,
    getUserTool,
    listWorkflowsTool,
    listTimeZonesTool
  ],
  triggers: [
    eventLifecycleTrigger,
    eventCheckoutTrigger,
    eventAttendeeTrigger,
    pollResponseTrigger,
    workflowActionTrigger
  ]
});
