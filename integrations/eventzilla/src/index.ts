import { Slate } from 'slates';
import { spec } from './spec';
import {
  listEventsTool,
  getEventTool,
  getEventTicketsTool,
  listAttendeesTool,
  getAttendeeTool,
  checkinAttendeeTool,
  listTransactionsTool,
  getTransactionTool,
  manageOrderTool,
  toggleEventSalesTool,
  prepareCheckoutTool,
  createCheckoutTool,
  fillOrderTool,
  confirmCheckoutTool,
  listUsersTool,
  getCategoriesTool
} from './tools';
import { newAttendeeTrigger, newTransactionTrigger, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listEventsTool,
    getEventTool,
    getEventTicketsTool,
    listAttendeesTool,
    getAttendeeTool,
    checkinAttendeeTool,
    listTransactionsTool,
    getTransactionTool,
    manageOrderTool,
    toggleEventSalesTool,
    prepareCheckoutTool,
    createCheckoutTool,
    fillOrderTool,
    confirmCheckoutTool,
    listUsersTool,
    getCategoriesTool
  ],
  triggers: [inboundWebhook, newAttendeeTrigger, newTransactionTrigger]
});
