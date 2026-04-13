import { Slate } from 'slates';
import { spec } from './spec';
import {
  getConnectionTool,
  updateConnectionTool,
  runActionTool,
  performQueryTool,
  testTriggerTool,
  fireWebhookTool,
  sendRealtimeNotificationTool,
  getFieldOptionsTool,
} from './tools';
import {
  connectionEventTrigger,
  triggerFiredTrigger,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getConnectionTool,
    updateConnectionTool,
    runActionTool,
    performQueryTool,
    testTriggerTool,
    fireWebhookTool,
    sendRealtimeNotificationTool,
    getFieldOptionsTool,
  ],
  triggers: [
    connectionEventTrigger,
    triggerFiredTrigger,
  ],
});
