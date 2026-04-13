import {
  Slate } from 'slates';
import { spec } from './spec';
import {
  sendEmail,
  listEmails,
  getEmail,
  searchEmails,
  updateEmail,
  manageFolders,
  manageLabels,
  manageTasks,
  manageNotes,
  manageBookmarks,
  getAccountInfo,
  manageOrganization,
} from './tools';
import {
  newEmail,
  newTask,
  inboundWebhook,
} from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    sendEmail,
    listEmails,
    getEmail,
    searchEmails,
    updateEmail,
    manageFolders,
    manageLabels,
    manageTasks,
    manageNotes,
    manageBookmarks,
    getAccountInfo,
    manageOrganization,
  ],
  triggers: [
    inboundWebhook,
    newEmail,
    newTask,
  ],
});
