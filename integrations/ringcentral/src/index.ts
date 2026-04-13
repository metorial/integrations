import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendSms,
  sendFax,
  makeCall,
  manageCall,
  listCallLogs,
  sendTeamMessage,
  manageMeeting,
  listMessages,
  getPresence,
  updatePresence,
  listExtensions,
  listPhoneNumbers,
} from './tools';
import {
  telephonyEvents,
  smsEvents,
  presenceEvents,
  messageEvents,
  teamMessagingEvents,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendSms,
    sendFax,
    makeCall,
    manageCall,
    listCallLogs,
    sendTeamMessage,
    manageMeeting,
    listMessages,
    getPresence,
    updatePresence,
    listExtensions,
    listPhoneNumbers,
  ],
  triggers: [
    telephonyEvents,
    smsEvents,
    presenceEvents,
    messageEvents,
    teamMessagingEvents,
  ],
});
