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
  uploadDocument,
  manageDocument,
  listTemplates,
  manageTemplate,
  manageWebhook
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
    uploadDocument,
    manageDocument,
    listTemplates,
    manageTemplate,
    manageWebhook
  ],
  triggers: [documentEvent]
});
