import { Slate } from 'slates';
import { spec } from './spec';
import {
  upsertContact,
  searchContacts,
  getContact,
  deleteContact,
  bulkUpsertContacts,
  listSegments,
  getSegmentContacts,
  updateSegmentMembership,
  sendEmail,
  sendSms,
  sendPreparedMessage,
  getMessageStatus,
  generateEvent,
  addOrders,
  deleteOrders,
  getAccountInfo,
  manageUnsubscribes
} from './tools';
import { messageActivity } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    upsertContact,
    searchContacts,
    getContact,
    deleteContact,
    bulkUpsertContacts,
    listSegments,
    getSegmentContacts,
    updateSegmentMembership,
    sendEmail,
    sendSms,
    sendPreparedMessage,
    getMessageStatus,
    generateEvent,
    addOrders,
    deleteOrders,
    getAccountInfo,
    manageUnsubscribes
  ],
  triggers: [
    messageActivity
  ]
});
