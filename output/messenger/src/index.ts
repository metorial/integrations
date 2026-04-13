import { Slate } from 'slates';
import { spec } from './spec';
import { sendMessage, sendTemplate, manageProfile, getUserProfile, senderAction, handover } from './tools';
import { messageReceived, messageDelivery, accountEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [sendMessage, sendTemplate, manageProfile, getUserProfile, senderAction, handover],
  triggers: [messageReceived, messageDelivery, accountEvent]
});
