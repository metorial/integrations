import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  sendInteractiveMessage,
  sendTemplateMessage,
  listTemplates,
  createTemplate,
  deleteTemplate,
  getMediaUrl,
  deleteMedia,
  getBusinessProfile,
  updateBusinessProfile,
  listPhoneNumbers,
  getPhoneNumber,
  registerPhoneNumber,
  markMessageRead
} from './tools';
import { messageReceived, messageStatus } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    sendInteractiveMessage,
    sendTemplateMessage,
    listTemplates,
    createTemplate,
    deleteTemplate,
    getMediaUrl,
    deleteMedia,
    getBusinessProfile,
    updateBusinessProfile,
    listPhoneNumbers,
    getPhoneNumber,
    registerPhoneNumber,
    markMessageRead
  ],
  triggers: [messageReceived, messageStatus]
});
