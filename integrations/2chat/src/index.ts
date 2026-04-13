import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendWhatsAppMessage,
  sendGroupMessage,
  listWhatsAppNumbers,
  checkWhatsAppNumber,
  manageWhatsAppGroup,
  listWhatsAppGroups,
  getWhatsAppMessages,
  manageContacts,
  deleteWhatsAppMessage
} from './tools';
import {
  whatsappMessageTrigger,
  whatsappMessageReceiptTrigger,
  whatsappGroupEventTrigger,
  whatsappConversationTrigger,
  whatsappCallTrigger,
  whatsappNumberStatusTrigger,
  whatsappOrderTrigger,
  phoneCallTrigger
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendWhatsAppMessage,
    sendGroupMessage,
    listWhatsAppNumbers,
    checkWhatsAppNumber,
    manageWhatsAppGroup,
    listWhatsAppGroups,
    getWhatsAppMessages,
    manageContacts,
    deleteWhatsAppMessage
  ],
  triggers: [
    whatsappMessageTrigger,
    whatsappMessageReceiptTrigger,
    whatsappGroupEventTrigger,
    whatsappConversationTrigger,
    whatsappCallTrigger,
    whatsappNumberStatusTrigger,
    whatsappOrderTrigger,
    phoneCallTrigger
  ]
});
