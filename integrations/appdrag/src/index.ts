import { Slate } from 'slates';
import { spec } from './spec';
import {
  executeSqlQuery,
  executeApiFunction,
  manageFiles,
  manageDirectories,
  sendEmail,
  manageNewsletterContacts,
  getFailedEmails
} from './tools';
import { newFormSubmission, newOrder, orderStatusUpdated, inboundWebhook } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    executeSqlQuery,
    executeApiFunction,
    manageFiles,
    manageDirectories,
    sendEmail,
    manageNewsletterContacts,
    getFailedEmails
  ],
  triggers: [inboundWebhook, newFormSubmission, newOrder, orderStatusUpdated]
});
