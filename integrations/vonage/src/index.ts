import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  sendSms,
  makeCall,
  manageCall,
  listCalls,
  verifyUser,
  checkVerification,
  numberInsight,
  manageNumbers,
  manageApplications,
  getAccountInfo
} from './tools';
import { messageEvents, voiceEvents, verifyEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    sendSms,
    makeCall,
    manageCall,
    listCalls,
    verifyUser,
    checkVerification,
    numberInsight,
    manageNumbers,
    manageApplications,
    getAccountInfo
  ],
  triggers: [messageEvents, voiceEvents, verifyEvents]
});
