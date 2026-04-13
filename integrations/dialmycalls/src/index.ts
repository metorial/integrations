import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  listContacts,
  manageContact,
  listGroups,
  manageGroup,
  createVoiceBroadcast,
  listVoiceBroadcasts,
  cancelVoiceBroadcast,
  createTextBroadcast,
  listTextBroadcasts,
  cancelTextBroadcast,
  manageRecording,
  listRecordings,
  manageCallerId,
  listCallerIds,
  listIncomingTexts,
  listKeywords,
  listVanityNumbers,
  listDoNotContacts,
  manageAccessAccount,
  listAccessAccounts,
  getAccount,
} from './tools';
import {
  newIncomingText,
  newContact,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listContacts,
    manageContact,
    listGroups,
    manageGroup,
    createVoiceBroadcast,
    listVoiceBroadcasts,
    cancelVoiceBroadcast,
    createTextBroadcast,
    listTextBroadcasts,
    cancelTextBroadcast,
    manageRecording,
    listRecordings,
    manageCallerId,
    listCallerIds,
    listIncomingTexts,
    listKeywords,
    listVanityNumbers,
    listDoNotContacts,
    manageAccessAccount,
    listAccessAccounts,
    getAccount,
  ],
  triggers: [
    inboundWebhook,
    newIncomingText,
    newContact,
  ],
});
