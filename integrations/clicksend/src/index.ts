import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendSmsTool,
  getSmsHistoryTool,
  cancelScheduledSmsTool,
  sendMmsTool,
  sendVoiceTool,
  sendEmailTool,
  sendLetterTool,
  createContactTool,
  updateContactTool,
  deleteContactTool,
  listContactsTool,
  listContactListsTool,
  createContactListTool,
  deleteContactListTool,
  getAccountTool,
  listDedicatedNumbersTool
} from './tools';
import { inboundSmsTrigger, smsDeliveryReceiptTrigger } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSmsTool,
    getSmsHistoryTool,
    cancelScheduledSmsTool,
    sendMmsTool,
    sendVoiceTool,
    sendEmailTool,
    sendLetterTool,
    createContactTool,
    updateContactTool,
    deleteContactTool,
    listContactsTool,
    listContactListsTool,
    createContactListTool,
    deleteContactListTool,
    getAccountTool,
    listDedicatedNumbersTool
  ],
  triggers: [inboundSmsTrigger, smsDeliveryReceiptTrigger]
});
