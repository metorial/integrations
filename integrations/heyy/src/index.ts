import { Slate } from 'slates';
import { spec } from './spec';
import {
  getBusinessTool,
  listContactsTool,
  createContactTool,
  updateContactTool,
  deleteContactTool,
  sendWhatsAppMessageTool,
  listChannelsTool,
  listMessageTemplatesTool,
  createBroadcastTool,
  listBroadcastsTool,
  startBroadcastTool,
  addBroadcastRecipientsTool,
  listChatsTool,
  updateChatTool,
  listWorkflowsTool,
  triggerWorkflowTool
} from './tools';
import { incomingMessageTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    getBusinessTool,
    listContactsTool,
    createContactTool,
    updateContactTool,
    deleteContactTool,
    sendWhatsAppMessageTool,
    listChannelsTool,
    listMessageTemplatesTool,
    createBroadcastTool,
    listBroadcastsTool,
    startBroadcastTool,
    addBroadcastRecipientsTool,
    listChatsTool,
    updateChatTool,
    listWorkflowsTool,
    triggerWorkflowTool
  ],
  triggers: [incomingMessageTrigger]
});
