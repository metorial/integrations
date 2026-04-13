import { Slate } from 'slates';
import { spec } from './spec';
import {
  sendWhatsAppMessage,
  sendSms,
  sendRcsMessage,
  sendEmail,
  sendOtp,
  listWhatsAppResources,
  getMessageReport,
  manageCollectionRecords,
  listCollections,
  manageListEntries,
  listLists,
  manageActivities,
  listWorkspaceMembers,
} from './tools';
import {
  incomingWhatsAppMessage,
  incomingRcsMessage,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendWhatsAppMessage,
    sendSms,
    sendRcsMessage,
    sendEmail,
    sendOtp,
    listWhatsAppResources,
    getMessageReport,
    manageCollectionRecords,
    listCollections,
    manageListEntries,
    listLists,
    manageActivities,
    listWorkspaceMembers,
  ],
  triggers: [
    incomingWhatsAppMessage,
    incomingRcsMessage,
  ],
});
