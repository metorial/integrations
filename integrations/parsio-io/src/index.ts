import { Slate } from 'slates';
import { spec } from './spec';
import {
  listMailboxes,
  getMailbox,
  createMailbox,
  updateMailbox,
  deleteMailbox,
  listDocuments,
  getDocument,
  submitDocument,
  reparseDocument,
  skipDocuments,
  getParsedData,
  getCollectedEmails,
  listTemplates,
  getTemplate,
  manageTemplates,
  listWebhooks,
  createWebhook,
  deleteWebhooks
} from './tools';
import { documentEvent } from './triggers';

export let provider = Slate.create({
  spec,
  tools: [
    listMailboxes,
    getMailbox,
    createMailbox,
    updateMailbox,
    deleteMailbox,
    listDocuments,
    getDocument,
    submitDocument,
    reparseDocument,
    skipDocuments,
    getParsedData,
    getCollectedEmails,
    listTemplates,
    getTemplate,
    manageTemplates,
    listWebhooks,
    createWebhook,
    deleteWebhooks
  ],
  triggers: [documentEvent]
});
