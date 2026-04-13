import { Slate } from 'slates';
import { spec } from './spec';
import { sendMessageTool, getAccountStatusTool } from './tools';
import { messageReceivedTrigger, messageAckTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [sendMessageTool, getAccountStatusTool],
  triggers: [messageReceivedTrigger, messageAckTrigger]
});
