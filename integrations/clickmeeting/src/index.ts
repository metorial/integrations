import { Slate } from 'slates';
import { spec } from './spec';
import {
  listConferences,
  getConference,
  createConference,
  updateConference,
  deleteConference,
  manageAccessTokens,
  registerAttendee,
  listRegistrations,
  getSessions,
  getSessionAttendees,
  generateSessionPdf,
  sendInvitations,
  generateAutologinUrl,
  listFiles,
  getFile,
  deleteFile,
  manageRecordings,
  addContact,
  getChatLogs,
  getTimezones,
  getPhoneGateways
} from './tools';

import { inboundWebhook } from './triggers/inbound-webhook';

export let provider = Slate.create({
  spec,
  tools: [
    listConferences,
    getConference,
    createConference,
    updateConference,
    deleteConference,
    manageAccessTokens,
    registerAttendee,
    listRegistrations,
    getSessions,
    getSessionAttendees,
    generateSessionPdf,
    sendInvitations,
    generateAutologinUrl,
    listFiles,
    getFile,
    deleteFile,
    manageRecordings,
    addContact,
    getChatLogs,
    getTimezones,
    getPhoneGateways
  ],
  triggers: [
    inboundWebhook,
  ]
});
