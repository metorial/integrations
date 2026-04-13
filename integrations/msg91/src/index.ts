import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendSms,
  sendOtp,
  verifyOtp,
  resendOtp,
  sendEmail,
  validateEmail,
  sendWhatsAppMessage,
  sendVoiceMessage,
  sendRcsMessage,
  runCampaign,
  createOrUpdateContact,
  searchContacts,
  deleteContacts,
  getPhonebookFields,
  trackEvent,
  getMessagingLogs
} from './tools';
import {
  smsDeliveryReport,
  emailDeliveryReport,
  whatsappDeliveryReport,
  voiceCallReport,
  rcsDeliveryReport
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSms,
    sendOtp,
    verifyOtp,
    resendOtp,
    sendEmail,
    validateEmail,
    sendWhatsAppMessage,
    sendVoiceMessage,
    sendRcsMessage,
    runCampaign,
    createOrUpdateContact,
    searchContacts,
    deleteContacts,
    getPhonebookFields,
    trackEvent,
    getMessagingLogs
  ],
  triggers: [
    smsDeliveryReport,
    emailDeliveryReport,
    whatsappDeliveryReport,
    voiceCallReport,
    rcsDeliveryReport
  ]
});
