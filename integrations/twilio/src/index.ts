import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  listMessages,
  makeCall,
  listCalls,
  modifyCall,
  lookupPhoneNumber,
  sendVerification,
  checkVerification,
  searchPhoneNumbers,
  managePhoneNumber,
  manageConversation,
  conversationParticipants,
  sendConversationMessage,
  manageMessagingService,
  listRecordings,
  listVerifyServices
} from './tools';
import { incomingMessage, messageStatus, incomingCall, callStatus } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    listMessages,
    makeCall,
    listCalls,
    modifyCall,
    lookupPhoneNumber,
    sendVerification,
    checkVerification,
    searchPhoneNumbers,
    managePhoneNumber,
    manageConversation,
    conversationParticipants,
    sendConversationMessage,
    manageMessagingService,
    listRecordings,
    listVerifyServices
  ],
  triggers: [incomingMessage, messageStatus, incomingCall, callStatus]
});
