import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendMessage,
  getMessage,
  searchPhoneNumbers,
  orderPhoneNumbers,
  listPhoneNumbers,
  managePhoneNumber,
  sendVerification,
  verifyCode,
  manageVerifyProfile,
  numberLookup,
  sendFax,
  dialCall,
  callAction,
  manageMessagingProfile,
  manageSimCard,
  getBalance
} from './tools';
import { messagingEvents, callEvents, faxEvents, verifyEvents } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendMessage,
    getMessage,
    searchPhoneNumbers,
    orderPhoneNumbers,
    listPhoneNumbers,
    managePhoneNumber,
    sendVerification,
    verifyCode,
    manageVerifyProfile,
    numberLookup,
    sendFax,
    dialCall,
    callAction,
    manageMessagingProfile,
    manageSimCard,
    getBalance
  ],
  triggers: [messagingEvents, callEvents, faxEvents, verifyEvents]
});
