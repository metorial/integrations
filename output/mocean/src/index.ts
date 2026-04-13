import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendSms,
  getMessageStatus,
  makeVoiceCall,
  hangupCall,
  sendVerification,
  checkVerification,
  resendVerification,
  numberLookup,
  sendWhatsApp,
  manageWhatsAppTemplates,
  getAccountInfo,
} from './tools';
import {
  smsEvents,
  whatsappEvents,
  voiceEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSms,
    getMessageStatus,
    makeVoiceCall,
    hangupCall,
    sendVerification,
    checkVerification,
    resendVerification,
    numberLookup,
    sendWhatsApp,
    manageWhatsAppTemplates,
    getAccountInfo,
  ],
  triggers: [
    smsEvents,
    whatsappEvents,
    voiceEvents,
  ],
});
